import { Module } from '@nestjs/common';
import { MikroOrmModule } from 'nestjs-mikro-orm';

import { AppUtils } from '../app/app.utils';
import OrmConnection from './orm.connection';

const enableOrm = AppUtils.getSettings().ORM_TYPE;
const entities = AppUtils.globToRequire([ '../../**/*.entity.js', '!../../**/abstract*entity.js' ]);

@Module({
  imports: [
    ...enableOrm ? [ MikroOrmModule.forRoot(OrmConnection) ] : [ ],
    ...enableOrm ? [ MikroOrmModule.forFeature({ entities }) ] : [ ],
  ],
  exports: [
    ...enableOrm ? [ MikroOrmModule.forFeature({ entities }) ] : [ ],
  ],
})
export class OrmModule { }
