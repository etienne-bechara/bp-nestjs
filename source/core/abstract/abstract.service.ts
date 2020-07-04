/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnyEntity, Collection, EntityRepository, FilterQuery } from 'mikro-orm';

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

  /** */
  public constructor(
    private readonly repository: EntityRepository<Entity>,
    protected readonly options: AbstractServiceOptions = { },
  ) {
    super();
    if (!this.options.collections) this.options.collections = [ ];
  }

  /**
   * Read and populate all entities that matches given criteria
   * Then, populate any OneToMany collections configured at
   * service options
   * @param id
   */
  public async readEntities(params: Entity, partial: AbstractPartialDto): Promise<Entity[] | AbstractPartialResponse<Entity>> {
    const fullSearch = !partial.limit || !partial.offset && partial.offset !== 0;
    let results: Entity[];
    let total: number;

    if (fullSearch) {
      results = await this.repository.find(params, {
        populate: this.options.populate,
      });
    }
    else {
      [ results, total ] = await this.repository.findAndCount(params, {
        populate: this.options.populate,
        limit: partial.limit,
        offset: partial.offset,
      });
    }

    await this.populateCollections(results);

    return fullSearch ? results : {
      limit: partial.limit,
      offset: partial.offset,
      total,
      results,
    };
  }

  /**
   * Given a set of entities and configured collection
   * population rules, apply them asynchronously
   * @param entities
   */
  public async populateCollections(entities: AnyEntity[]): Promise<void> {
    await Promise.all(entities.map(async(entity) => {
      await Promise.all(this.options.collections.map(async(collection) => {
        entity[collection.name] = await collection.provider.repository.find({
          [collection.reference]: entity.id,
        });
      }));
    }));
  }

  /**
   * Reads a single entity by its ID
   * @param id
   */
  public async readEntityById(id: FilterQuery<Entity>): Promise<Entity> {
    const entity = await this.repository.findOne(id, this.options.populate);
    if (!entity) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
    return entity;
  }

  /**
   * Given plain data, creates a single entity and persist
   * it into the database
   * @param data
   */
  public async createEntity(data: Partial<Entity> | any): Promise<Entity> {

    const newEntity = this.repository.create(data);
    for (const key in newEntity) {
      if (newEntity[key] instanceof Collection) {
        delete newEntity[key];
      }
    }

    try {
      await this.repository.createQueryBuilder()
        .insert({ ...newEntity, ...data }) // Re-add `_id` props removed by .create
        .execute();
    }
    catch (e) {
      this.queryExceptionHandler(e, data);
    }
    return this.repository.findOne(newEntity, this.options.populate);
  }

  /**
   * Updates a singles entity by its id with plain data
   * and return the updated object
   * @param id
   * @param data
   */
  public async updateEntityById(id: FilterQuery<Entity>, data: Partial<Entity> | any): Promise<Entity> {

    await this.readEntityById(id);
    try {
      await this.repository.createQueryBuilder()
        .update({ ...data })
        .where({ id })
        .execute();
    }
    catch (e) {
      this.queryExceptionHandler(e, data);
    }
    return this.readEntityById(id);
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteEntityById(id: FilterQuery<Entity>): Promise<void> {
    const entity = await this.readEntityById(id);
    try {
      await this.repository.removeAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }
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
