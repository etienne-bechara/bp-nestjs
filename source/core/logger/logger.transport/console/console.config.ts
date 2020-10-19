import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../../../app/app.enum';
import { ConfigService } from '../../../config/config.service';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class ConsoleConfig extends ConfigService {

  public readonly CONSOLE_TRANSPORT_OPTIONS = [
    { environment: AppEnvironment.LOCAL, level: LoggerLevel.DEBUG },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.NOTICE },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
  ];

}
