import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { AppConfig } from './app.config';
import { AppModule } from './app.module';

/**
 * This class acts as a helper when bootstrapping.
 * It will not be injected through Nest framework.
 */
export class AppService {
  private configService: ConfigService<AppConfig>;
  private loggerService: LoggerService;
  private server: NestExpressApplication;

  /**
   * Starts Express server through Nest JS framework.
   * Apply the following customizations according to config:
   * • Configure CORS
   * • Set JSON limit
   * • Disable timeout (handled in custom interceptor).
   */
  public async bootServer(): Promise<void> {
    await ConfigService.populateConfig();

    this.server = await NestFactory.create(AppModule, {
      logger: [ 'error', 'warn' ],
    });

    this.configService = this.server.get('ConfigService');
    this.loggerService = this.server.get('LoggerService');

    this.server.enableCors(this.configService.get('APP_CORS_OPTIONS'));
    this.server.use(
      json({ limit: this.configService.get('APP_JSON_LIMIT') }),
    );

    const httpServer = await this.server.listen(this.configService.get('PORT'));
    httpServer.setTimeout(0);

    const timeoutStr = this.configService.get('APP_TIMEOUT')
      ? `set to ${(this.configService.get('APP_TIMEOUT') / 1000).toString()}s`
      : 'disabled';
    this.loggerService.debug(`Server timeouts are ${timeoutStr}`);
    this.loggerService.success(`Server listening on port ${this.configService.get('PORT')}`);
  }

}
