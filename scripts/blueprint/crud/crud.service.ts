import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'mikro-orm';
import { InjectRepository } from 'nestjs-mikro-orm';

import { OrmService } from '../core/orm/orm.service';
import { __PascalCaseName__Entity } from './__DotCaseName__.entity';

@Injectable()
export class __PascalCaseName__Service extends OrmService<__PascalCaseName__Entity> {

  /**
   * Creates default methods and exception handling for
   * __PascalCaseName__ Entity manipulation
   *
   * We must inject the matching repository exported by ORM
   * @param __CamelCaseName__Repository
   */
  public constructor(
    @InjectRepository(__PascalCaseName__Entity)
    private readonly __CamelCaseName__Repository: EntityRepository<__PascalCaseName__Entity>,
  ) {
    super(__CamelCaseName__Repository, {
      defaults: {
        uniqueKey: [ ], // Default key to match when upserting (can be overriden in method)
        populate: [ ], // Default properties to cascade read (can be overriden in method)
      },
    });
  }

}
