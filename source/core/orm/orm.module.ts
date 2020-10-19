import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { LoggerService } from '../logger/logger.service';
import { OrmConfig } from './orm.config';

const rootEntities = AppConfig.globToRequire('./**/*.entity.{ts,js}');
const featureEntities = AppConfig.globToRequire([
  './**/*.entity.{js,ts}',
  '!./**/orm*entity.{js,ts}',
]);

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ OrmConfig, LoggerService ],
      useFactory: (
        ormConfig: OrmConfig,
        loggerService: LoggerService,
      ) => {
        return {
          type: ormConfig.ORM_TYPE,
          host: ormConfig.ORM_HOST,
          port: ormConfig.ORM_PORT,
          user: ormConfig.ORM_USERNAME,
          password: ormConfig.ORM_PASSWORD,
          dbName: ormConfig.ORM_DATABASE,
          pool: ormConfig.ORM_POOL_CONFIG,
          driverOptions: ormConfig.ORM_DRIVER_OPTIONS,
          baseDir: __dirname,
          entities: rootEntities,
          logger: (msg): void => loggerService.debug(`ORM ${msg}`),
          namingStrategy: UnderscoreNamingStrategy,
          debug: ormConfig.NODE_ENV === AppEnvironment.LOCAL,
        };
      },
    }),
    MikroOrmModule.forFeature({ entities: featureEntities }),
  ],
  providers: [ OrmConfig ],
  exports: [
    OrmConfig,
    MikroOrmModule.forFeature({ entities: featureEntities }),
  ],
})
export class OrmModule { }
