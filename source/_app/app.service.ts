import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { LoggerService } from '../_logger/logger.service';
import { Settings } from '../settings';
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

    this.logger.debug('Booting application...');
    this.server = await NestFactory.create(
      AppModule,
      new FastifyAdapter(),
      { logger: [ 'error', 'warn' ] },
    );

    this.settings.APP_ORM_TYPE
      ? this.logger.success('ORM connection ENABLED', { localOnly: true })
      : this.logger.warning('ORM connection DISABLED', { localOnly: true });

    await this.setServerTimeout();

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

}
