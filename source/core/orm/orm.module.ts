import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { ConfigService } from '../config/config.service';
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
      inject: [ ConfigService, LoggerService ],
      useFactory: (
        configService: ConfigService<AppConfig & OrmConfig>,
        loggerService: LoggerService,
      ) => ({
        type: configService.get('ORM_TYPE'),
        host: configService.get('ORM_HOST'),
        port: configService.get('ORM_PORT'),
        user: configService.get('ORM_USERNAME'),
        password: configService.get('ORM_PASSWORD'),
        dbName: configService.get('ORM_DATABASE'),
        pool: configService.get('ORM_POOL_CONFIG'),
        driverOptions: configService.get('ORM_DRIVER_OPTIONS'),
        baseDir: __dirname,
        entities: rootEntities,
        logger: (msg): void => loggerService.debug(`ORM ${msg}`),
        namingStrategy: UnderscoreNamingStrategy,
        debug: configService.get('NODE_ENV') === AppEnvironment.LOCAL,
      }),
    }),
    MikroOrmModule.forFeature({ entities: featureEntities }),
  ],
  exports: [
    MikroOrmModule.forFeature({ entities: featureEntities }),
  ],
})
export class OrmModule { }
