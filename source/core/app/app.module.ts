
import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { ConfigModule } from '../config/config.module';
import { AppConfig } from './app.config';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppMetadataMiddleware } from './app.middleware';

const modules = AppConfig.globToRequire([
  './**/*.module.{js,ts}',
  '!./**/app.module.{js,ts}',
  '!./**/config.module.{js,ts}',
]).reverse();

/**
 * Globally loads all files matching the *.module.ts pattern.
 * Handles configuration separately as it can be loaded async.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRootAsync(),
    ...modules,
  ],
  exports: [
    ConfigModule,
    ...modules,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe => new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {

  /**
   * Applies desired middlewares.
   * @param consumer
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        AppMetadataMiddleware,
      )
      .forRoutes('*');
  }
}
