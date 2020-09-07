import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { OrmService } from '../core/orm/orm.service';
import { _Pascal_Entity } from './_Dot_.entity';

@Injectable()
export class _Pascal_Service extends OrmService<_Pascal_Entity> {

  /**
   * Creates default methods and exception handling for
   * _Pascal_ Entity manipulation.
   *
   * We must inject the matching repository exported by ORM.
   * @param _Camel_Repository
   */
  public constructor(
    @InjectRepository(_Pascal_Entity)
    private readonly _Camel_Repository: EntityRepository<_Pascal_Entity>,
  ) {
    super(_Camel_Repository, {
      defaults: {
        uniqueKey: [ ], // Default key to match when upserting (can be overriden in method)
        populate: [ ], // Default properties to cascade read (can be overriden in method)
      },
    });
  }

}
