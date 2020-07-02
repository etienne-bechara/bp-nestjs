import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AbstractProvider } from '../abstract/abstract.provider';
import { AppModule } from './app.module';

export class AppService extends AbstractProvider {
  private server: NestExpressApplication;

  /**
   * Starts the Fastify server through Nest JS framework
   */
  public async bootServer(): Promise<void> {

    this.logger.debug('Booting application...');
    this.server = await NestFactory.create(AppModule, {
      logger: [ 'error', 'warn' ],
      cors: this.settings.APP_CORS_OPTIONS,
    });

    this.settings.APP_ORM_TYPE
      ? this.logger.success('ORM connection ENABLED', { localOnly: true })
      : this.logger.warning('ORM connection DISABLED', { localOnly: true });

    this.logger.debug(`Setting global request timeout to ${this.settings.APP_TIMEOUT / 1000}s...`);
    const httpServer = await this.server.listen(this.settings.PORT);
    httpServer.setTimeout(this.settings.APP_TIMEOUT);
    this.logger.success(`Server listening on port ${this.settings.PORT}`);
  }

}
