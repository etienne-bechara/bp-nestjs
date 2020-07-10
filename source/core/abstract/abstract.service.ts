/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnyEntity, EntityRepository, FindOptions } from 'mikro-orm';

import { AbstractPartialResponse, AbstractServiceOptions } from './abstract.interface';
import { AbstractProvider } from './abstract.provider';

/**
 * Creates an abstract service tied with a repository
 */
export abstract class AbstractService<Entity> extends AbstractProvider {
  protected DUPLICATE_ENTRY: string = 'unique constraint violation';
  protected FK_FAIL_CREATE: string = 'must reference an existing entity';
  protected FK_FAIL_DELETE: string = 'constraint prevents cascade deletion';
  protected QUERY_FAIL: string = 'failed to execute query statement';
  protected NOT_FOUND: string = 'entity with given id does not exist';
  protected ENTITY_UNDEFINED: string = 'cannot persist undefined entity';
  protected UK_REFERENCE_FAIL: string = 'unique constraint references more than one entity';
  protected UK_MISSING: string = 'missing unique key declaration for upsert';

  /** */
  public constructor(
    private readonly repository: EntityRepository<Entity>,
    protected readonly options: AbstractServiceOptions = { },
  ) {
    super();
    if (!this.options.defaults) this.options.defaults = { };
  }

  /**
   * Wrapper responsible for all SELECT operations
   * @param params
   * @param populate
   */
  private async find(params: Partial<Entity> | string, options: FindOptions = { }): Promise<any> {

    options.populate = options.populate || this.options.defaults.populate;
    options.refresh = true;

    try {
      // One by ID
      if (typeof params === 'string') {
        const idParam: AnyEntity = { id: params };
        const [ entity ] = await this.repository.find(idParam, options);
        if (!entity) throw new NotFoundException(this.NOT_FOUND);
        return entity;
      }

      // Many with Offset
      else if (options.limit) {
        const limit = options.limit;
        const offset = options.offset;
        const [ results, total ] = await this.repository.findAndCount(params, options);
        return { limit, offset, total, results };
      }

      // Many
      return this.repository.find(params, options);
    }
    catch (e) {
      this.queryExceptionHandler(e, params);
    }
  }

  /**
   * Wrapper responsible for all INSERT and UPDATE operations
   * @param entity
   */
  private async save(entity: Entity): Promise<void> {
    if (!entity) {
      throw new InternalServerErrorException(this.ENTITY_UNDEFINED);
    }
    try {
      await this.repository.persistAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }
  }

  /**
   * Wrapper responsible for all DELETE operations
   * @param entity
   */
  private async remove(entity: Entity): Promise<Entity> {
    try {
      await this.repository.removeAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }
    return entity;
  }

  /**
   * Read all entities that matches given criteria
   * @param id
   */
  public async read(params: Partial<Entity>, options: FindOptions = { }): Promise<Entity[]> {
    return this.find(params, options);
  }

  /**
   * Read, populate and count all entities that matches given criteria
   * Returns an object contining limit, offset, total and results
   * @param id
   */
  public async readAndCount(params: Entity, options: FindOptions = { }): Promise<AbstractPartialResponse<Entity>> {
    if (!options.limit) options.limit = 1000;
    if (!options.offset) options.offset = 0;
    return this.find(params, options);
  }

  /**
   * Reads a single entity by its ID and populate
   * its configured collections
   * @param id
   */
  public async readById(id: string, options: FindOptions = { }): Promise<Entity> {
    return this.find(id, options);
  }

  /**
   * Creates a new entity from raw data or from an already
   * initialized entity
   * @param data
   */
  public async create(data: Partial<Entity> | any): Promise<Entity> {
    const newEntity = this.repository.create(data);
    await this.save(newEntity);
    return this.readById(newEntity['id']);
  }

  /**
   * Updates an already instatiated entity from raw data
   * @param entity
   * @param data
   */
  public async update(entity: Entity, data: Partial<Entity>): Promise<Entity> {
    const dummyEntity = this.repository.create(data);
    let updateRequired = false;

    for (const key in data) {
      if (entity[key] !== dummyEntity[key]) {
        entity[key] = data[key];
        updateRequired = true;
      }
    }

    if (updateRequired) await this.save(entity);
    return updateRequired
      ? this.readById(entity['id'])
      : entity;
  }

  /**
   * Updates a singles entity by its id with plain data
   * and return the updated object
   * @param id
   * @param data
   */
  public async updateById(id: string, data: Partial<Entity> | any): Promise<Entity> {
    const target = await this.readById(id);
    return this.update(target, data);
  }

  /**
   * Given a set of strings to use as constraint fields,
   * creates or updates given entity and return its instance
   * @param uniqueKey
   * @param data
   */
  public async upsert(data: Partial<Entity> | any, uniqueKey?: string[] ): Promise<Entity> {
    uniqueKey = uniqueKey || this.options.defaults.uniqueKey;
    if (!uniqueKey) {
      throw new InternalServerErrorException(this.UK_MISSING);
    }

    const clause = { };
    for (const key of uniqueKey) {
      clause[key] = data[key];
    }
    const matchingEntities = await this.read(clause);

    if (matchingEntities.length > 1) {
      throw new ConflictException({
        message: this.UK_REFERENCE_FAIL,
        unique_key: uniqueKey,
        matches: matchingEntities.map((e) => e['id']),
      });
    }
    else if (matchingEntities.length === 1) {
      return this.update(matchingEntities[0], data);
    }
    return this.create(data);
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    return this.remove(entity);
  }

  /**
   * Handles all query exceptions
   * @param e
   */
  protected queryExceptionHandler(e: Error, data: Partial<Entity> | any): void {

    if (e.message.match(/duplicate entry/gi)) {
      const violation = /entry '(.+?)' for/gi.exec(e.message);
      throw new ConflictException({
        message: this.DUPLICATE_ENTRY,
        violation: violation ? violation[1] : null,
      });
    }

    else if (e.message.match(/cannot add.+foreign key.+fails/gi)) {
      const violation = /references `(.+?)`/gi.exec(e.message);
      const failedConstraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${failedConstraint} ${this.FK_FAIL_CREATE}`);
    }

    else if (e.message.match(/cannot delete.+foreign key.+fails/gi)) {
      const violation = /\.`(.+?)`, constraint/gi.exec(e.message);
      const failedConstraint = violation ? violation[1] : 'undefined';
      throw new ConflictException(`${failedConstraint} ${this.FK_FAIL_DELETE}`);
    }

    else {
      throw new InternalServerErrorException({
        message: this.QUERY_FAIL,
        query: e.message,
        data,
      });
    }
  }

}
