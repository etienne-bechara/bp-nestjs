import { LoggerLevel } from '../logger.enum';

export interface LoggerParams {
  level: LoggerLevel;
  labelColor: string;
  messageColor: string;
  label: string;
  message: string | Error;
  data: any; // eslint-disable-line
  error?: Error;
  stack?: string;
}
