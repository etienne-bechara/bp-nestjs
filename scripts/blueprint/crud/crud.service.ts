import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'mikro-orm';
import { InjectRepository } from 'nestjs-mikro-orm';

import { AbstractService } from '../core/abstract/abstract.service';
import { __PascalCaseName__Entity } from './__DotCaseName__.entity';

@Injectable()
export class __PascalCaseName__Service extends AbstractService<__PascalCaseName__Entity> {

  /** */
  public constructor(
    @InjectRepository(__PascalCaseName__Entity)
    private readonly __SnakeCaseName__Repository: EntityRepository<__PascalCaseName__Entity>,
  ) {
    super(__SnakeCaseName__Repository);
  }

}
