
import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { UtilService } from '../util/util.service';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppMetadataMiddleware } from './app.middleware';
import { AppSettings } from './app.settings';

const appSettings: AppSettings = UtilService.parseSettings();
const validationRules = appSettings.APP_VALIDATION_RULES;
const modules = UtilService.globToRequire([
  './**/*.module.js',
  '!./**/app.module.js',
]).reverse();

/**
 * Globally loads all files matching the module.ts pattern.
 */
@Global()
@Module({
  imports: modules,
  exports: modules,
  providers: [
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_PIPE, useFactory: (): ValidationPipe => new ValidationPipe(validationRules) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
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
