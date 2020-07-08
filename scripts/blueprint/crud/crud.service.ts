import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'mikro-orm';
import { InjectRepository } from 'nestjs-mikro-orm';

import { AbstractService } from '../core/abstract/abstract.service';
import { __PascalCaseName__Entity } from './__DotCaseName__.entity';

@Injectable()
export class __PascalCaseName__Service extends AbstractService<__PascalCaseName__Entity> {

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
      uniqueKey: [ ], // Default key to match when upserting, can be overriden in method
      populate: [ ], // Properties to cascade when selecting from the database
    });
  }

}
