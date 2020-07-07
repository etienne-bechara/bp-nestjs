/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnyEntity, Collection, EntityRepository } from 'mikro-orm';

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
  }

  /**
   * Read all entities that matches given criteria
   * @param id
   */
  public async read(params: Entity): Promise<Entity[]> {
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
   * Given plain data, creates a single entity and persist
   * it into the database
   * @param data
   */
  public async createFromDto(data: Partial<Entity> | any): Promise<Entity> {

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
    return this.readById(newEntity['id']);
  }

  /**
   * Updates a singles entity by its id with plain data
   * and return the updated object
   * @param id
   * @param data
   */
  public async updateByIdFromDto(id: string, data: Partial<Entity> | any): Promise<Entity> {

    await this.readById(id);
    try {
      await this.repository.createQueryBuilder()
        .update({ ...data })
        .where({ id })
        .execute();
    }
    catch (e) {
      this.queryExceptionHandler(e, data);
    }
    return this.readById(id);
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteById(id: string): Promise<void> {
    const entity = await this.readById(id);
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
