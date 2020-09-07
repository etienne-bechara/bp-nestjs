import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { UtilService } from '../util/util.service';
import OrmConnection from './orm.connection';
import { OrmSettings } from './orm.settings';

const enableOrm = UtilService.parseSettings<OrmSettings>().ORM_TYPE;
const logger = UtilService.getLoggerService();
const entities = UtilService.globToRequire([
  './**/*.entity.js',
  '!./**/orm*entity.js',
]);

enableOrm
  ? logger.success('[ENABLED] ORM connection ', { private: true })
  : logger.warning('[DISABLED] ORM connection', { private: true });

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
