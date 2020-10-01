import { DynamicModule, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Module({ })
export class ConfigModule {

  /**
   * During initialization, asynchronously create a cache
   * of all application configurations.
   */
  public static async forRootAsync(): Promise<DynamicModule> {
    await ConfigService.populateConfig();
    return {
      module: ConfigModule,
      providers: [ ConfigService ],
      exports: [ ConfigService ],
    };
  }

}
