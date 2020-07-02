import { Module } from '@nestjs/common';
import { MikroOrmModule } from 'nestjs-mikro-orm';

import { AppUtils } from '../app/app.utils';
import OrmSettings from './orm.settings';

const entities = AppUtils.globToRequire('../../**/*.entity.js');
const enableOrm = AppUtils.getSettings().APP_ORM_TYPE;

@Module({
  imports: [
    ...enableOrm ? [ MikroOrmModule.forRoot(OrmSettings) ] : [ ],
    ...enableOrm ? [ MikroOrmModule.forFeature({ entities }) ] : [ ],
  ],
  exports: [
    ...enableOrm ? [ MikroOrmModule.forFeature({ entities }) ] : [ ],
  ],
})
export class OrmModule { }
