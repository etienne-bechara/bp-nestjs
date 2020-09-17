import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { OrmService } from '../core/orm/orm.service';
import { PascalCaseEntity } from './dot.case.entity';

@Injectable()
export class PascalCaseService extends OrmService<PascalCaseEntity> {

  /**
   * Creates default methods and exception handling for
   * PascalCase Entity manipulation.
   *
   * We must inject the matching repository exported by ORM.
   * @param camelCaseRepository
   */
  public constructor(
    @InjectRepository(PascalCaseEntity)
    private readonly camelCaseRepository: EntityRepository<PascalCaseEntity>,
  ) {
    super(camelCaseRepository, {
      defaults: {
        uniqueKey: [ ], // Default key to match when upserting (can be overriden in method)
        populate: [ ], // Default properties to cascade read (can be overriden in method)
      },
    });
  }

}
