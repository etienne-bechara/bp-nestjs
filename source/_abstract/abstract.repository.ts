import { BadRequestException, ConflictException } from '@nestjs/common';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';

export class AbstractRepository<T> extends Repository<T> {
  public DUPLICATE_ENTRY_MESSAGE: string = 'unique constraint violation';
  public FK_FAIL_CREATE_MESSAGE: string = 'must reference an existing entity';
  public FK_FAIL_DELETE_MESSAGE: string = 'constraint prevents cascade deletion';

  /**
   * Saves an entity, if a unique or foreign constraint
   * fails throw an exception accordingly
   * @param data
   */
  public async saveOrReject(data: DeepPartial<T>): Promise<T> {
    let newEntity;
    try {
      newEntity = await this.save(data);
    }
    catch (e) {
      if (e.message.match(/duplicate entry/gi)) {
        const violation = /entry '(.+?)' for/gi.exec(e.message);
        throw new ConflictException({
          message: this.DUPLICATE_ENTRY_MESSAGE,
          violation: violation ? violation[1] : null,
        });
      }
      else if (e.message.match(/foreign key constraint fails/gi)) {
        const violation = /key \(`(.+?)`\) references/gi.exec(e.message);
        const failedConstraint = violation ? violation[1] : 'undefined';
        throw new BadRequestException(`${failedConstraint} ${this.FK_FAIL_CREATE_MESSAGE}`);
      }
      else {
        throw e;
      }
    }
    return this.findOne(newEntity.id);
  }

  /**
   * Deletes an entity by its unique ID, if a foreign constraint
   * fails throw an exception accordingly
   * @param data
   */
  public async deleteOrReject(id: string | number): Promise<number> {
    let result: DeleteResult;
    try {
      result = await this.delete(id);
      return result.affected;
    }
    catch (e) {
      if (e.message.match(/foreign key constraint fails/gi)) {
        const violation = /\.`(.+?)`, constraint/gi.exec(e.message);
        const failedConstraint = violation ? violation[1] : 'undefined';
        throw new ConflictException(`${failedConstraint} ${this.FK_FAIL_DELETE_MESSAGE}`);
      }
      else {
        throw e;
      }
    }
  }

}
