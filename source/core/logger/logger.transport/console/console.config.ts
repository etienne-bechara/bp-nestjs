import { AppEnvironment } from '../../../app/app.enum';
import { LoggerLevel } from '../../logger.enum';

export class ConsoleConfig {

  public readonly CONSOLE_TRANSPORT_OPTIONS = [
    { environment: AppEnvironment.LOCAL, level: LoggerLevel.DEBUG },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.NOTICE },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
  ];

}
