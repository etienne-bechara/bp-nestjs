/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EntityRepository, FilterQuery } from 'mikro-orm';

import { AbstractPartialDto } from './abstract.dto';
import { AbstractPartialResponse } from './abstract.interface';
import { AbstractProvider } from './abstract.provider';

/**
 * Creates an abstract service tied with a repository
 */
export abstract class AbstractService<Entity> extends AbstractProvider {
  public DUPLICATE_ENTRY_MESSAGE: string = 'unique constraint violation';
  public FK_FAIL_CREATE_MESSAGE: string = 'must reference an existing entity';
  public FK_FAIL_DELETE_MESSAGE: string = 'constraint prevents cascade deletion';
  public QUERY_FAIL_MESSAGE: string = 'failed to execute query statement';
  public NOT_FOUND_MESSAGE: string = 'entity with given id does not exist';

  /** */
  public constructor(private readonly repository: EntityRepository<Entity>) { super(); }

  /**
   * Reads all entities that matches given criteria
   * @param id
   */
  public async readEntities(params: Entity, partial: AbstractPartialDto, populate: boolean | string[] = true): Promise<Entity[] | AbstractPartialResponse<Entity>> {

    if (!partial.limit || !partial.offset && partial.offset !== 0) {
      return this.repository.find(params, populate);
    }

    const [ entities, count ] = await this.repository.findAndCount(params, {
      populate,
      limit: partial.limit,
      offset: partial.offset,
    });

    return {
      limit: partial.limit,
      offset: partial.offset,
      total: count,
      results: entities,
    };
  }

  /**
   * Reads a single entity by its ID
   * @param id
   */
  public async readEntityById(id: FilterQuery<Entity>, populate: boolean | string[] = true): Promise<Entity> {
    const entity = await this.repository.findOne(id, populate);
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
    try {
      await this.repository.createQueryBuilder()
        .insert({ ...newEntity, ...data }) // Re-add `_id` props removed by .create
        .execute();
    }
    catch (e) {
      this.queryExceptionHandler(e, data);
    }
    return this.repository.findOne(newEntity, true);
  }

  /**
   * Updates a singles entity by its id with plain data
   * and return the updated object
   * @param id
   * @param data
   */
  public async updateEntityById(id: FilterQuery<Entity>, data: Partial<Entity> | any): Promise<Entity> {

    await this.readEntityById(id, false);
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
    const entity = await this.readEntityById(id, false);
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
  private queryExceptionHandler(e: Error, data: Partial<Entity> | any): void {
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
