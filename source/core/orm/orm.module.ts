import { Module } from '@nestjs/common';
import { MikroOrmModule } from 'nestjs-mikro-orm';

import { AppUtils } from '../app/app.utils';
import OrmConnection from './orm.connection';
import { OrmSettings } from './orm.settings';

const enableOrm = AppUtils.parseSettings<OrmSettings>().ORM_TYPE;
const logger = AppUtils.getLogger();
const entities = AppUtils.globToRequire([ './**/*.entity.js', '!./**/orm*entity.js' ]);

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
