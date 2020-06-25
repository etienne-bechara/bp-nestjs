import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { HttpsService } from '../_https/https.service';
import { RedisService } from '../_redis/redis.service';
import { StatusController } from '../_status/status.controller';
import { StatusService } from '../_status/status.service';
import { settings } from '../main';
import { Controllers, Providers, Repositories } from '../settings';
import { AppAuthMiddleware } from './middlewares/app.auth.middleware';
import { AppCorsMiddleware } from './middlewares/app.cors.middleware';
import { AppLoggerMiddleware } from './middlewares/app.logger.middleware';

const ormConnectionOptions: TypeOrmModuleOptions = {
  type: settings.APP_ORM_TYPE,
  host: settings.APP_ORM_HOST,
  port: settings.APP_ORM_PORT,
  username: settings.APP_ORM_USERNAME,
  password: settings.APP_ORM_PASSWORD,
  database: settings.APP_ORM_DATABASE,
  synchronize: settings.APP_ORM_SYNCHRONIZE,
  entities: [ `${__dirname}/../**/*.entity.{js,ts}` ],
  logging: [ 'error' ],
  extra: {
    connectionLimit: settings.APP_ORM_POOL_LIMIT,
    waitForConnections: true,
  },
};

/**
 * Load all controllers and providers
 */
@Global()
@Module({

  imports: [
    ...settings.APP_ORM_TYPE ? [ TypeOrmModule.forRoot(ormConnectionOptions) ] : [ ],
    ...settings.APP_ORM_TYPE ? [ TypeOrmModule.forFeature(Repositories) ] : [ ],
  ],

  controllers: [
    StatusController,
    ...Controllers,
  ],

  providers: [
    HttpsService,
    RedisService,
    StatusService,
    ...Providers,
  ],

})
export class AppModule {

  /**
   * Apply desired authentication middle to each route
   * @param consumer Application default consumer
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        AppCorsMiddleware,
        AppLoggerMiddleware,
        AppAuthMiddleware,
      )
      .forRoutes('*');
  }

}
