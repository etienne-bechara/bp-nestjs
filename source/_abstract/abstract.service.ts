import { NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AbstractProvider } from './abstract.provider';
import { AbstractRepository } from './abstract.repository';
import { AbstractPartialDto } from './dto/abstract.partial.dto';
import { AbstractPartialEntity } from './interfaces/abstract.partial.entity';

/**
 * Creates an abstract service tied with a repository
 */
export class AbstractService<Entity> extends AbstractProvider {
  public NOT_FOUND_MESSAGE: string = 'entity with given id does not exist';

  /** */
  public constructor(private readonly repository: AbstractRepository<Entity>) { super(); }

  /**
   * Reads all entities that matches given criteria
   * @param id
   */
  public async readEntities(params: DeepPartial<Entity>, partial: AbstractPartialDto): Promise<Entity[] | AbstractPartialEntity<Entity>> {

    if (!partial.limit || !partial.offset && partial.offset !== 0) {
      return this.repository.find(params);
    }

    const [ entities, count ] = await this.repository.findAndCount({
      where: params,
      take: partial.limit,
      skip: partial.offset,
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
  public async readEntityById(id: string | number): Promise<Entity> {
    const entity = await this.repository.findOne(id);
    if (!entity) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
    return entity;
  }

  /**
   * Creates a single entity given already valid data
   * @param data
   */
  public async createEntity(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.saveOrReject(data);
  }

  /**
   * Updates a singles entity by its id and return
   * the updated object
   * @param id
   * @param data
   */
  public async updateEntityById(id: string | number, data: DeepPartial<Entity>): Promise<Entity> {
    await this.readEntityById(id);
    return this.repository.saveOrReject({ id, ...data });
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteEntityById(id: string | number): Promise<void> {
    const affected = await this.repository.deleteOrReject(id);
    if (!affected) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
  }

}
