import { Controller } from '@nestjs/common';

import { OrmController } from '../core/orm/orm.controller';
import { _Pascal_CreateDto, _Pascal_ReadDto, _Pascal_UpdateDto } from './_Dot_.dto';
import { _Pascal_Entity } from './_Dot_.entity';
import { _Pascal_Service } from './_Dot_.service';

@Controller('_Path_')
export class _Pascal_Controller extends OrmController<_Pascal_Entity> {

  /**
   * Create default routes for  _Pascal_ Entity manipulation
   * Includes GET, GET_BY_ID, POST, PUT, PUT_BY_ID and DELETE_BY_ID
   *
   * We must inject the service containing default handling methods
   * @param _Camel_Service
   */
  public constructor(private readonly _Camel_Service: _Pascal_Service) {
    super(_Camel_Service, {
      dto: {
        read: _Pascal_ReadDto, // Validation rules when reading [GET]
        create: _Pascal_CreateDto, // Validation rules when creating [POST, PUT]
        update: _Pascal_UpdateDto, // Validation rules when updating [PUT_BY_ID]
      },
      // routes: {
      //   exclude: [ ], // Array of default routes to exclude
      //   only: [ ], // Array of default routes to enable (overrides above)
      // },
    });
  }

}
