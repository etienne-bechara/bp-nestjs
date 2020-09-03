/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import moment from 'moment';

import { AppEnvironment } from '../app/app.enum';
import { LoggerLevel } from './logger.enum';
import { LoggerParams } from './logger.interface';
import { LoggerSettings } from './logger.settings';

@Injectable()
export class LoggerService {
  private sentryEnabled: boolean;
  private chalk: any;

  public constructor(private settings: LoggerSettings & { NODE_ENV: AppEnvironment}) {
    this.setupLogger();
  }

  /**
   * Enable Sentry integration if the minum level configured
   * at settings matches the current environment
   * Then add a process listener to catch any unhandled exception.
   */
  private setupLogger(): void {
    this.chalk = this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT
      ? require('chalk')
      : undefined;

    this.info(`Environment configured as ${this.settings.NODE_ENV}`, { private: true });

    this.sentryEnabled =
      this.settings.LOGGER_SENTRY_DSN
      && this.settings.LOGGER_SENTRY_ENVIRONMENTS.includes(this.settings.NODE_ENV);

    if (this.sentryEnabled) {
      Sentry.init({
        dsn: this.settings.LOGGER_SENTRY_DSN,
        environment: this.settings.NODE_ENV,
        integrations: (ints) => ints.filter((i) => i.name !== 'OnUncaughtException'),
      });
      this.success('[ENABLED] Sentry integration', { private: true });
    }
    else {
      this.warning('[DISABLED] Sentry integration', { private: true });
    }

    process.on('uncaughtException', (err) => {
      this.error(err, { unexpected: true });
    });
  }

  /**
   *
   * Normalizes incoming data object, and if stack is not present for errors
   * crete it shifting the trace to ignore this file.
   * @param params
   */
  private log(params: LoggerParams): void {
    try {

      if (!params.message) params.message = '';
      if (params.data && typeof params.data !== 'object') {
        params.data = { data: params.data };
      }

      if (params.message instanceof Error) {
        params.error = params.message;
        params.message = params.error.message;
      }
      else if (params.level <= LoggerLevel.ERROR) {
        params.error = new Error(params.message);
        const stack = params.error.stack.split('\n');
        stack.splice(1, 2);
        params.error.stack = stack.join('\n');
      }

      this.printLog(params);
      this.publishLog(params);
    }

    // Catch exceptions during the logging procedure
    // This should never happen unless some connection is lost
    catch (e) {
      e.message = `Logger: Exception during event logging - ${e.message}`;
      if (this.sentryEnabled) Sentry.captureException(e);
      console.error(e);
    }
  }

  /**
   * Print messages in the console:
   * - STAGING & PRODUCTION: prints at stderr and only for WARNING+
   * - DEVELOPMENT: prints as colored string for any level.
   * @param params
   */
  private printLog(params: LoggerParams): void {

    if (this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
      const nowStr = moment().format('YYYY-MM-DD HH:mm:ss');
      const stackStr = params.error
        ? `  at ${require('clean-stack')(params.error.stack)
          .split(' at ').splice(1).map((str: string) =>
            str.replace(/\s+/g, ' ').trim(),
          ).join('\n  at ')}`
        : undefined;

      console.log(this.chalk`{grey ${nowStr}} {${params.labelColor}  ${params.label} } {${params.messageColor} ${params.message}}`);
      if (stackStr && params.level <= LoggerLevel.ERROR) console.log(this.chalk`{grey ${stackStr}}`);
      if (params.data && !params.data.private) console.log(params.data);
    }

    else if (params.level <= LoggerLevel.WARNING) {
      console.log(params.message);
      if (params.data && !params.data.private) console.log(params.data);
      if (params.error) console.error(params.error);
    }
  }

  /**
   * Publish events of Sentry according to minimun configured level.
   * @param params
   */
  private publishLog(params: LoggerParams): void {
    if (params.data && params.data.private) return undefined;

    if (this.sentryEnabled && params.level <= this.settings.LOGGER_SENTRY_MINIMUM_LEVEL) {
      let sentryLevel;
      if (params.level === LoggerLevel.DEBUG) sentryLevel = Sentry.Severity.Debug;
      else if (params.level === LoggerLevel.INFO) sentryLevel = Sentry.Severity.Info;
      else if (params.level === LoggerLevel.WARNING) sentryLevel = Sentry.Severity.Warning;
      else if (params.level === LoggerLevel.ERROR) sentryLevel = Sentry.Severity.Error;
      else sentryLevel = Sentry.Severity.Critical;

      Sentry.withScope((scope) => {
        scope.setLevel(sentryLevel);
        if (params.data && params.data.unexpected) scope.setTag('unexpected', 'true');
        scope.setExtras(params.data);
        Sentry.captureException(params.error);
      });
    }
  }

  /**
   * CRITICAL - Display as red.
   * @param message
   * @param data
   */
  public critical(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.CRITICAL,
      labelColor: 'white.bgRed',
      messageColor: 'red',
      label: 'CRT',
      message,
      data,
    });
  }

  /**
   * ERROR - Display as red.
   * @param message
   * @param data
   */
  public error(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.ERROR,
      labelColor: 'black.bgRed',
      messageColor: 'red',
      label: 'ERR',
      message,
      data,
    });
  }

  /**
   * WARNING - Display as yellow.
   * @param message
   * @param data
   */
  public warning(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.WARNING,
      labelColor: 'black.bgYellow',
      messageColor: 'yellow',
      label: 'WRN',
      message,
      data,
    });
  }

  /**
   * INFO (Generic) - Display as white.
   * @param message
   * @param data
   */
  public info(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgWhite',
      messageColor: 'white',
      label: 'INF',
      message,
      data,
    });
  }

  /**
   * INFO (Success) - display as green.
   * @param message
   * @param data
   */
  public success(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgGreen',
      messageColor: 'green',
      label: 'INF',
      message,
      data,
    });
  }

  /**
   * INFO (HTTP) - display as cyan.
   * @param message
   * @param data
   */
  public server(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgCyan',
      messageColor: 'cyan',
      label: 'INF',
      message,
      data,
    });
  }

  /**
   * DEBUG - Display as grey.
   * @param message
   * @param data
   */
  public debug(message: string | Error, data?: any): void {
    this.log({
      level: LoggerLevel.DEBUG,
      labelColor: 'black.bgBlue',
      messageColor: 'grey',
      label: 'DBG',
      message,
      data,
    });
  }

}
