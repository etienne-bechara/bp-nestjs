import { Injectable } from '@nestjs/common';
import { IsOptional, IsUrl } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { ConfigService } from '../../../config/config.service';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class SentryConfig extends ConfigService {

  /* Environment Variables */
  @IsOptional()
  @IsUrl()
  public readonly SENTRY_DSN: string;

  /* Service Options */
  public readonly SENTRY_TRANSPORT_OPTIONS = [
    { environment: AppEnvironment.LOCAL, level: null },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.ERROR },
  ];

}
