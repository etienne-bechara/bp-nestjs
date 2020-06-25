import { NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AbstractProvider } from './abstract.provider';
import { AbstractRepository } from './abstract.repository';

/**
 * Creates an abstract service tied with a repository
 */
export class AbstractService<Entity> extends AbstractProvider {
  private NOT_FOUND_MESSAGE: string = 'entity with given id does not exist';

  /** */
  public constructor(private readonly repository: AbstractRepository<Entity>) { super(); }

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
    return this.repository.save(data);
  }

  /**
   * Updates a singles entity by its id and return
   * the updated object
   * @param id
   * @param data
   */
  public async updateById(id: string | number, data: DeepPartial<Entity>): Promise<Entity> {
    const { affected } = await this.repository.update(id, data);
    if (!affected) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
    return this.readEntityById(id);
  }

  /**
   * Deletes a single entity by its id
   * @param id
   */
  public async deleteById(id: string | number): Promise<void> {
    const { affected } = await this.repository.delete(id);
    if (!affected) throw new NotFoundException(this.NOT_FOUND_MESSAGE);
  }

}
