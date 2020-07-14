import { Module } from '@nestjs/common';
import { MikroOrmModule } from 'nestjs-mikro-orm';

import { AppUtils } from '../app/app.utils';
import OrmConnection from './orm.connection';

const enableOrm = AppUtils.getSettings().ORM_TYPE;
const logger = AppUtils.getLogger();
const entities = AppUtils.globToRequire([ '../../**/*.entity.js', '!../../**/orm*entity.js' ]);

enableOrm
  ? logger.success('ORM connection ENABLED', { localOnly: true })
  : logger.warning('ORM connection DISABLED', { localOnly: true });

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
