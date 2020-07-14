import { Controller } from '@nestjs/common';

import { OrmController } from '../core/orm/orm.controller';
import { __PascalCaseName__CreateDto, __PascalCaseName__ReadDto, __PascalCaseName__UpdateDto } from './__DotCaseName__.dto';
import { __PascalCaseName__Entity } from './__DotCaseName__.entity';
import { __PascalCaseName__Service } from './__DotCaseName__.service';

@Controller('__PathCaseName__')
export class __PascalCaseName__Controller extends OrmController<__PascalCaseName__Entity> {

  /**
   * Create default routes for  __PascalCaseName__ Entity manipulation
   * Includes GET, GET_BY_ID, POST, PUT, PUT_BY_ID and DELETE_BY_ID
   *
   * We must inject the service containing default handling methods
   * @param __CamelCaseName__Service
   */
  public constructor(private readonly __CamelCaseName__Service: __PascalCaseName__Service) {
    super(__CamelCaseName__Service, {
      dto: {
        read: __PascalCaseName__ReadDto, // Validation rules when reading [GET]
        create: __PascalCaseName__CreateDto, // Validation rules when creating [POST, PUT]
        update: __PascalCaseName__UpdateDto, // Validation rules when updating [PUT_BY_ID]
      },
      // routes: {
      //   exclude: [ ], // Array of default routes to exclude
      //   only: [ ], // Array of default routes to enable (overrides above)
      // },
    });
  }

}
