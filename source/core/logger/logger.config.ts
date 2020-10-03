import { IsOptional, IsUrl } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { LoggerLevel } from './logger.enum';

export class LoggerConfig {

  /* Environment Variables */
  @IsOptional()
  @IsUrl()
  public readonly LOGGER_SENTRY_DSN: string;

  /* Service Settings */
  public readonly LOGGER_SENTRY_MINIMUM_LEVEL: LoggerLevel = LoggerLevel.ERROR;

  public readonly LOGGER_SENTRY_ENVIRONMENTS: AppEnvironment[] = [
    AppEnvironment.PRODUCTION,
    AppEnvironment.STAGING,
  ];

}
