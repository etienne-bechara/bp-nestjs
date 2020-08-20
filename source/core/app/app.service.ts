import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';
import { AppProvider } from './app.provider';
import { AppSettings } from './app.settings';

export class AppService extends AppProvider {
  private settings: AppSettings = this.getSettings();
  private server: NestExpressApplication;

  /**
   * Starts Express server through Nest JS framework
   *
   * Disables server timeout since it will be handled
   * into a separate interceptor
   */
  public async bootServer(): Promise<void> {

    this.server = await NestFactory.create(AppModule, {
      logger: [ 'error', 'warn' ],
      cors: this.settings.APP_CORS_OPTIONS,
    });

    this.server.use(json({ limit: this.settings.APP_JSON_LIMIT }));

    const httpServer = await this.server.listen(this.settings.PORT);
    httpServer.setTimeout(0);

    const timeoutStr = this.settings.APP_TIMEOUT
      ? `set to ${(this.settings.APP_TIMEOUT / 1000).toString()}s`
      : 'disabled';
    this.logger.debug(`Server timeouts are ${timeoutStr}`);
    this.logger.success(`Server listening on port ${this.settings.PORT}`);
  }

}
