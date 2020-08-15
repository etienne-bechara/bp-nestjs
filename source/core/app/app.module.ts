import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppFilter } from './app.filter';
import { AppGuard } from './app.guard';
import { AppLoggerInterceptor } from './app.interceptor';
import { AppMetadataMiddleware } from './app.middleware';
import { AppSettings } from './app.settings';
import { AppUtils } from './app.utils';

const modules = AppUtils.globToRequire([ './**/*.module.js', '!./**/app.module.js' ]).reverse();
const validationRules = AppUtils.parseSettings<AppSettings>().APP_VALIDATION_RULES;

/**
 * Globally loads all files matching the module.ts pattern
 */
@Global()
@Module({
  imports: modules,
  exports: modules,
  providers: [
    { provide: APP_GUARD, useClass: AppGuard },
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_PIPE, useFactory: (): ValidationPipe => new ValidationPipe(validationRules) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
  ],
})
export class AppModule {
  /** */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AppMetadataMiddleware)
      .forRoutes('*');
  }
}
