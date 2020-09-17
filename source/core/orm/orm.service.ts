/* eslint-disable unicorn/no-fn-reference-in-iterator */

import { EntityData, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { BadRequestException, ConflictException, InternalServerErrorException,
  NotFoundException, NotImplementedException } from '@nestjs/common';

import { AppProvider } from '../app/app.provider';
import { OrmFindOptions, OrmPartialResponse, OrmServiceOptions } from './orm.interface';

/**
 * Creates an abstract service tied with a repository.
 */
export abstract class OrmService<Entity> extends AppProvider {
  protected readonly DUPLICATE_ENTRY: string = 'unique constraint violation';
  protected readonly ENTITY_UNDEFINED: string = 'cannot persist undefined entity';
  protected readonly FK_FAIL_CREATE: string = 'must reference an existing entity';
  protected readonly FK_FAIL_DELETE: string = 'constraint prevents cascade deletion';
  protected readonly NOT_FOUND: string = 'entity with given id does not exist';
  protected readonly PROPERTY_NON_EXISTANT: string = 'property does not exist on entity';
  protected readonly QUERY_FAIL: string = 'failed to execute query statement';
  protected readonly UK_REFERENCE_FAIL: string = 'unique constraint references more than one entity';
  protected readonly UK_MISSING: string = 'missing default unique key implementation';

  public constructor(
    private readonly repository: EntityRepository<Entity>,
    protected readonly options: OrmServiceOptions = { },
  ) {
    super();
    if (!this.options.defaults) this.options.defaults = { };
  }

  /**
   * Wrapper responsible for all SELECT operations.
   * @param params
   * @param options
   * @param partial
   */
  private async find(
    params: FilterQuery<Entity> | EntityData<Entity> | string,
    options: OrmFindOptions<Entity> = { },
    partial?: boolean,
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
      const idParam: any = { id: params };
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
        count,
        records,
      };
    }

    // Many as Array
    return this.repository.find(params, options);
  }

  /**
   * Wrapper responsible for all INSERT and UPDATE operations.
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
   * Wrapper responsible for all DELETE operations.
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
   * Validate provided unique key or the optionally configured
   * default one. If none, throw an exception.
   * @param uniqueKey
   */
  private validateUniqueKey(uniqueKey: string[]): string[] {
    const defaultKey = this.options.defaults.uniqueKey;
    let validKey: string[];

    if (Array.isArray(uniqueKey) && uniqueKey.length > 0) validKey = uniqueKey;
    else if (Array.isArray(defaultKey) && defaultKey.length > 0) validKey = defaultKey;

    if (!validKey) throw new NotImplementedException(this.UK_MISSING);
    return validKey;
  }

  /**
   * Read all entities that matches given criteria.
   * @param params
   * @param options
   */
  public async read(
    params: FilterQuery<Entity> | EntityData<Entity>,
    options: OrmFindOptions<Entity> = { },
  ): Promise<Entity[]> {
    const entities = await this.find(params, options);
    return Array.isArray(entities) ? entities : undefined;
  }

  /**
   * Read a supposedly unique entity, if the constraint
   * fails throw a conflict exception.
   * @param params
   * @param options
   */
  public async readUnique(
    params: FilterQuery<Entity> | EntityData<Entity>,
    options: OrmFindOptions<Entity> = { },
  ): Promise<Entity> {
    const entities = await this.find(params, options);

    if (Array.isArray(entities) && entities.length > 1) {
      throw new ConflictException({
        message: this.UK_REFERENCE_FAIL,
        params,
        entities,
      });
    }

    return entities[0] && 'id' in entities[0] ? entities[0] : undefined;
  }

  /**
   * Read, populate and count all entities that matches given criteria
   * Returns an object contining limit, offset, total and results.
   * @param params
   * @param options
   */
  public async readAndCount(
    params: FilterQuery<Entity> | Entity,
    options: OrmFindOptions<Entity> = { },
  ): Promise<OrmPartialResponse<Entity>> {
    if (!options.limit) options.limit = 1000;
    if (!options.offset) options.offset = 0;
    const result = await this.find(params, options, true);
    return 'records' in result ? result : undefined;
  }

  /**
   * Reads a single entity by its ID and populate
   * its configured collections.
   * @param id
   * @param options
   */
  public async readById(id: string, options: OrmFindOptions<Entity> = { }): Promise<Entity> {
    const entity = await this.find(id, options);
    return 'id' in entity ? entity : undefined;
  }

  /**
   * Creates a new entity from raw data or from an already
   * initialized entity.
   * @param data
   */
  public async create(data: EntityData<Entity>): Promise<Entity> {
    const newEntity = this.repository.create(data);
    await this.save(newEntity);
    return this.readById(newEntity['id']);
  }

  /**
   * Updates an already instatiated entity from raw data.
   * @param entity
   * @param data
   */
  public async update(entity: Entity, data: EntityData<Entity>): Promise<Entity> {
    const dummyEntity = this.repository.create(data);
    const dummyData = Object.assign({ }, data);
    let updateRequired = false;

    for (const key in dummyData) {
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
   * and return the updated object.
   * @param id
   * @param data
   */
  public async updateById(id: string, data: EntityData<Entity>): Promise<Entity> {
    const target = await this.readById(id);
    return this.update(target, data);
  }

  /**
   * Read, update or insert according to provided
   * data, unique key and whether or not to update.
   * @param data
   * @param uniqueKey
   * @param allowUpdate
   * @param failOnDuplicate
   */
  public async readCreateOrUpdate(
    data: EntityData<Entity>, uniqueKey?: string[], allowUpdate?: boolean, failOnDuplicate?: boolean,
  ): Promise<Entity> {

    uniqueKey = this.validateUniqueKey(uniqueKey);
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
      return allowUpdate
        ? this.update(matchingEntities[0], data)
        : matchingEntities[0];
    }

    // When creating, allow a single retry (prevent parallel creation exception)
    try {
      const newEntity = await this.create(data);
      return newEntity;
    }
    catch (e) {
      if (failOnDuplicate) throw e;
      return this.readCreateOrUpdate(data, uniqueKey, false, true);
    }
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or update matching one.
   * @param data
   * @param uniqueKey
   */
  public async upsert(data: EntityData<Entity>, uniqueKey?: string[]): Promise<Entity> {
    return this.readCreateOrUpdate(data, uniqueKey, true);
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or returns matching one.
   * @param data
   * @param uniqueKey
   */
  public async resert(data: EntityData<Entity>, uniqueKey?: string[]): Promise<Entity> {
    return this.readCreateOrUpdate(data, uniqueKey, false);
  }

  /**
   * Deletes a single entity by its id.
   * @param id
   */
  public async deleteById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    return this.remove(entity);
  }

  /**
   * Handles all query exceptions.
   * @param e
   * @param data
   */
  protected queryExceptionHandler(e: Error, data: EntityData<Entity> | any): void {

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
