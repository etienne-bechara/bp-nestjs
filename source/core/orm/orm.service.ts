/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AnyEntity, EntityRepository, QueryOrder } from 'mikro-orm';

import { AppProvider } from '../app/app.provider';
import { OrmFindOptions, OrmPartialResponse, OrmServiceOptions } from './orm.interface';

/**
 * Creates an abstract service tied with a repository
 */
export abstract class OrmService<Entity> extends AppProvider {
  protected DUPLICATE_ENTRY: string = 'unique constraint violation';
  protected ENTITY_UNDEFINED: string = 'cannot persist undefined entity';
  protected FK_FAIL_CREATE: string = 'must reference an existing entity';
  protected FK_FAIL_DELETE: string = 'constraint prevents cascade deletion';
  protected NOT_FOUND: string = 'entity with given id does not exist';
  protected PROPERTY_NON_EXISTANT: string = 'property does not exist on entity';
  protected QUERY_FAIL: string = 'failed to execute query statement';
  protected UK_REFERENCE_FAIL: string = 'unique constraint references more than one entity';
  protected UK_MISSING: string = 'missing default unique key implementation';

  /** */
  public constructor(
    private readonly repository: EntityRepository<Entity>,
    protected readonly options: OrmServiceOptions = { },
  ) {
    super();
    if (!this.options.defaults) this.options.defaults = { };
  }

  /**
   * Wrapper responsible for all SELECT operations
   * @param params
   * @param populate
   */
  private async find(
    params: Partial<Entity> | string, options: OrmFindOptions = { }, partial?: boolean,
  ): Promise<Entity | Entity[] | OrmPartialResponse<Entity>> {

    // Assign defaults
    options.populate = options.populate || this.options.defaults.populate;
    options.order = options.order || 'id:asc';
    options.refresh = true;
    options.orderBy = {
      [options.order.split(':')[0]]: QueryOrder[options.order.split(':')[1]],
    };

    // One by ID
    if (typeof params === 'string') {
      const idParam: AnyEntity = { id: params };
      const [ entity ] = await this.repository.find(idParam, options);
      if (!entity) throw new NotFoundException(this.NOT_FOUND);
      return entity;
    }

    // Many with Pagination
    else if (partial) {
      const [ records, count ] = await this.repository.findAndCount(params, options);
      return {
        order: options.order,
        limit: options.limit,
        offset: options.offset,
        count, records,
      };
    }

    // Many as Array
    return this.repository.find(params, options);
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
  public async read(params: Partial<Entity>, options: OrmFindOptions = { }): Promise<Entity[]> {
    const entities = await this.find(params, options);
    return Array.isArray(entities) ? entities : undefined;
  }

  /**
   * Read, populate and count all entities that matches given criteria
   * Returns an object contining limit, offset, total and results
   * @param id
   */
  public async readAndCount(params: Entity, options: OrmFindOptions = { }): Promise<OrmPartialResponse<Entity>> {
    if (!options.limit) options.limit = 1000;
    if (!options.offset) options.offset = 0;
    const result = await this.find(params, options, true);
    return 'records' in result ? result : undefined;
  }

  /**
   * Reads a single entity by its ID and populate
   * its configured collections
   * @param id
   */
  public async readById(id: string, options: OrmFindOptions = { }): Promise<Entity> {
    const entity = await this.find(id, options);
    return 'id' in entity ? entity : undefined;
  }

  /**
   * Creates a new entity from raw data or from an already
   * initialized entity
   * @param data
   */
  public async create(data: Partial<Entity>): Promise<Entity> {
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
  public async updateById(id: string, data: Partial<Entity>): Promise<Entity> {
    const target = await this.readById(id);
    return this.update(target, data);
  }

  /**
   * Given a set of strings to use as constraint fields,
   * creates or updates given entity and return its instance
   * @param uniqueKey
   * @param data
   */
  public async upsert(data: Partial<Entity>, uniqueKey?: string[] ): Promise<Entity> {
    uniqueKey = uniqueKey || this.options.defaults.uniqueKey;
    if (!uniqueKey || Object.keys(uniqueKey).length === 0) {
      throw new NotImplementedException(this.UK_MISSING);
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

    else if (e.message.match(/query by not existing property/gi)) {
      const violation = /.+\.(.+)/gi.exec(e.message);
      const failedConstraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${failedConstraint} ${this.PROPERTY_NON_EXISTANT}`);
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
