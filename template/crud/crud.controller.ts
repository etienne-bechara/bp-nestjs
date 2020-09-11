import { Controller } from '@nestjs/common';

import { OrmController } from '../core/orm/orm.controller';
import { PascalCaseCreateDto, PascalCaseReadDto, PascalCaseUpdateDto } from './dot.case.dto';
import { PascalCaseEntity } from './dot.case.entity';
import { PascalCaseService } from './dot.case.service';

@Controller('path/case')
export class PascalCaseController extends OrmController<PascalCaseEntity> {

  /**
   * Create default routes for  PascalCase Entity manipulation
   * Includes GET, GET_BY_ID, POST, PUT, PUT_BY_ID and DELETE_BY_ID.
   *
   * We must inject the service containing default handling methods.
   * @param camelCaseService
   */
  public constructor(private readonly camelCaseService: PascalCaseService) {
    super(camelCaseService, {
      dto: {
        read: PascalCaseReadDto, // Validation rules when reading [GET]
        create: PascalCaseCreateDto, // Validation rules when creating [POST, PUT]
        update: PascalCaseUpdateDto, // Validation rules when updating [PUT_BY_ID]
      },
      // routes: {
      //   exclude: [ ], // Array of default routes to exclude
      //   only: [ ], // Array of default routes to enable (overrides above)
      // },
    });
  }

}
