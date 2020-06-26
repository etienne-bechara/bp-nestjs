import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { HttpsService } from '../_https/https.service';
import { settings } from '../_main';
import { RedisService } from '../_redis/redis.service';
import { Controllers, Providers, Repositories } from '../components';
import { AppFilter } from './app.filter';
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
    ...Controllers,
  ],

  providers: [
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_PIPE, useFactory: (): ValidationPipe => new ValidationPipe(settings.APP_VALIDATION_RULES) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    HttpsService,
    RedisService,
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
