import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '../app.module';
import { AppSettings } from '../app.settings';
import { AppProvider } from './app.provider';

export class AppService extends AppProvider {
  private settings: AppSettings = this.getSettings();
  private server: NestExpressApplication;

  /**
   * Starts Express server through Nest JS framework
   */
  public async bootServer(): Promise<void> {

    this.server = await NestFactory.create(AppModule, {
      logger: [ 'error', 'warn' ],
      cors: this.settings.APP_CORS_OPTIONS,
    });

    this.logger.debug(`Setting global request timeout to ${this.settings.APP_TIMEOUT / 1000}s...`);
    const httpServer = await this.server.listen(this.settings.PORT);
    httpServer.setTimeout(this.settings.APP_TIMEOUT);
    this.logger.success(`Server listening on port ${this.settings.PORT}`);
  }

}
