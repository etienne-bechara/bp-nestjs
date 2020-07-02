import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppFilter } from './app.filter';
import { AppAuthMiddleware, AppLoggerMiddleware } from './app.middleware';
import { AppUtils } from './app.utils';

const modules = AppUtils.globToRequire([ '../../**/*.module.js', '!../../**/app.module.js' ]);
const validationRules = AppUtils.getSettings().APP_VALIDATION_RULES;

/**
 * Load all modules which includes providers, controllers,
 * and repositories
 */
@Global()
@Module({
  imports: modules,
  exports: modules,
  providers: [
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_PIPE, useFactory: (): ValidationPipe => new ValidationPipe(validationRules) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
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
        AppLoggerMiddleware, // Handles custom parsing (must be first)
        AppAuthMiddleware,
      )
      .forRoutes('*');
  }

}
