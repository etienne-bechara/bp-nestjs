import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { LoggerService } from '../_logger/logger.service';
import { Settings } from '../settings';
import { AppEnvironment } from './app.enum';
import { AppFilter } from './app.filter';
import { AppModule } from './app.module';

export class AppService {
  private server: NestFastifyApplication;

  /** */
  public constructor(
    private readonly settings: Settings,
    private readonly logger: LoggerService,
  ) { }

  /**
   * Starts the Fastify server through Nest JS framework
   */
  public async bootServer(): Promise<void> {

    this.logger.debug(`Booting server on port ${this.settings.PORT}...`);
    this.server = await NestFactory.create(
      AppModule,
      new FastifyAdapter(),
      { logger: [ 'error', 'warn' ] },
    );

    await this.setServerTimeout();
    await this.enableCors();
    await this.applyFilters();
    await this.logInboundActivity();

    await this.server.listen(this.settings.PORT, this.settings.APP_INTERFACE);
    this.logger.success(`Server listening on port ${this.settings.PORT}`);
  }

  /**
   * Configures the maximum of time before socket timeout
   */
  private async setServerTimeout(): Promise<void> {
    this.logger.debug(`Setting global request timeout to ${this.settings.APP_TIMEOUT / 1000}s...`);
    this.server.register((app, opts, next) => {
      app.server.setTimeout(this.settings.APP_TIMEOUT);
      next();
    });
  }

  /**
   * Enables CORS for all methods
   */
  private async enableCors(): Promise<void> {
    if (!this.settings.APP_ENABLE_CORS) return undefined;
    this.logger.debug('Enabling CORS...');
    this.server.enableCors();
    this.server.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      next();
    });
  }

  /**
   * Apply global filters on inbound requests or exceptions
   */
  private async applyFilters(): Promise<void> {
    this.logger.debug('Applying global validation pipe and exception filter...');
    this.server.useGlobalFilters(new AppFilter());
    this.server.useGlobalPipes(new ValidationPipe(this.settings.APP_VALIDATION_RULES));
  }

  /**
   * Log inbound requests for debug purposes during development
   */
  private async logInboundActivity(): Promise<void> {
    if (this.settings.NODE_ENV !== AppEnvironment.DEVELOPMENT) return undefined;
    this.logger.debug('Enabling inbound server logging...');
    this.server.use((req, res, next) => {
      this.logger.server(`Inbound: ${req.method} ${req.url}`);
      next();
    });
  }

}
