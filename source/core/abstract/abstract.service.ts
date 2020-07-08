/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnyEntity, EntityRepository } from 'mikro-orm';

import { AbstractPartialDto } from './abstract.dto';
import { AbstractPartialResponse, AbstractServiceOptions } from './abstract.interface';
import { AbstractProvider } from './abstract.provider';

/**
 * Creates an abstract service tied with a repository
 */
export abstract class AbstractService<Entity> extends AbstractProvider {
  protected DUPLICATE_ENTRY_MESSAGE: string = 'unique constraint violation';
  protected FK_FAIL_CREATE_MESSAGE: string = 'must reference an existing entity';
  protected FK_FAIL_DELETE_MESSAGE: string = 'constraint prevents cascade deletion';
  protected QUERY_FAIL_MESSAGE: string = 'failed to execute query statement';
  protected NOT_FOUND_MESSAGE: string = 'entity with given id does not exist';
  protected ENTITY_UNDEFINED_MESSAGE: string = 'cannot persist undefined entity';
  protected UK_REFERENCE_FAIL_MESSAGE: string = 'unique constraint references more than one entity';
  protected UK_MISSING_MESSAGE: string = 'missing unique key declaration for upsert';

  /** */
  public constructor(
    private readonly repository: EntityRepository<Entity>,
    protected readonly options: AbstractServiceOptions = { },
  ) {
    super();
  }

  /**
   * Read all entities that matches given criteria
   * @param id
   */
  public async read(params: Partial<Entity>): Promise<Entity[]> {
    return this.repository.find(params, {
      populate: this.options.populate,
      refresh: true,
    });
  }

  /**
   * Read, populate and count all entities that matches given criteria
   * Returns an object contining limit, offset, total and results
   * @param id
   */
  public async readAndCount(params: Entity, partial: AbstractPartialDto = { }): Promise<AbstractPartialResponse<Entity>> {
    const [ results, total ] = await this.repository.findAndCount(params, {
      populate: this.options.populate,
      refresh: true,
      limit: partial.limit || null,
      offset: partial.offset || 0,
    });

    return {
      limit: partial.limit || null,
      offset: partial.offset || 0,
      total,
      results,
    };
  }

  /**
   * Reads a single entity by its ID and populate
   * its configured collections
   * @param id
   */
  public async readById(id: string): Promise<Entity> {
    const params: AnyEntity = { id };
    const [ entity ] = await this.repository.find(params, {
      populate: this.options.populate,
      refresh: true,
    });
    if (!entity) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
    return entity;
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
    uniqueKey = uniqueKey || this.options.uniqueKey;
    if (!uniqueKey) {
      throw new InternalServerErrorException(this.UK_MISSING_MESSAGE);
    }

    const clause = { };
    for (const key of uniqueKey) {
      clause[key] = data[key];
    }
    const matchingEntities = await this.read(clause);

    if (matchingEntities.length > 1) {
      throw new ConflictException({
        message: this.UK_REFERENCE_FAIL_MESSAGE,
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
   * Saves an already initialized entity and handles
   * any of the several exception that might occuor
   * @param entity
   */
  public async save(entity: Entity): Promise<void> {
    if (!entity) {
      throw new InternalServerErrorException(this.ENTITY_UNDEFINED_MESSAGE);
    }
    try {
      await this.repository.persistAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    try {
      await this.repository.removeAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }
    return entity;
  }

  /**
   * Handles exception during INSERT or UPDATE operations
   * @param e
   */
  protected queryExceptionHandler(e: Error, data: Partial<Entity> | any): void {

    if (e.message.match(/duplicate entry/gi)) {
      const violation = /entry '(.+?)' for/gi.exec(e.message);
      throw new ConflictException({
        message: this.DUPLICATE_ENTRY_MESSAGE,
        violation: violation ? violation[1] : null,
      });
    }

    else if (e.message.match(/cannot add.+foreign key.+fails/gi)) {
      const violation = /key \(`(.+?)`\) references/gi.exec(e.message);
      const failedConstraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${failedConstraint} ${this.FK_FAIL_CREATE_MESSAGE}`);
    }

    else if (e.message.match(/cannot delete.+foreign key.+fails/gi)) {
      const violation = /\.`(.+?)`, constraint/gi.exec(e.message);
      const failedConstraint = violation ? violation[1] : 'undefined';
      throw new ConflictException(`${failedConstraint} ${this.FK_FAIL_DELETE_MESSAGE}`);
    }

    else {
      throw new InternalServerErrorException({
        message: this.QUERY_FAIL_MESSAGE,
        query: e.message,
        data,
      });
    }
  }

}
