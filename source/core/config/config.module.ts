import { DynamicModule, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Module({
  providers: [ ConfigService ],
  exports: [ ConfigService ],
})
export class ConfigModule {

  /**
   * During initialization, asynchronously create a cache
   * of all application configurations.
   */
  public static async registerAsync(): Promise<DynamicModule> {
    await ConfigService.populateConfig();
    return {
      module: ConfigModule,
    };
  }

}
