import { BadRequestException, ConflictException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';

export class AbstractRepository<T> extends Repository<T> {
  public DUPLICATE_ENTRY_MESSAGE: string = 'new data violates unique constraint';
  public FOREIGN_KEY_FAIL_MESSAGE: string = 'must reference an existing entity';

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
        throw new BadRequestException(`${failedConstraint} ${this.FOREIGN_KEY_FAIL_MESSAGE}`);
      }
      else {
        throw e;
      }
    }
    return newEntity;
  }

}
