import { Global, MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthMiddleware } from '../_auth/auth.middleware';
import { HttpsService } from '../_https/https.service';
import { RedisService } from '../_redis/redis.service';

/**
 * Load all controllers and providers
 */
@Global()
@Module({
  imports: [ ],

  controllers: [

  ],

  providers: [
    HttpsService,
    RedisService,
  ],

})
export class AppModule {

  /**
   * Apply desired authentication middle to each route
   * @param consumer Application default consumer
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }

}
