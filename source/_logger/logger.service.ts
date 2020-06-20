/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import moment from 'moment';

import { AppEnvironment } from '../_app/app.enum';
import { Settings } from '../settings';
import { LoggerParams } from './interfaces/logger.params';
import { LoggerLevel } from './logger.enum';

@Injectable()
export class LoggerService {
  private sentryEnabled: boolean;

  /** */
  public constructor(private settings: Settings) { this.loggerSetup(); }

  /**
   * Set up Sentry integration and add a custom catch exception listener
   */
  private loggerSetup(): void {
    this.info(`Environment configured as ${this.settings.NODE_ENV}`, { localOnly: true });
    this.sentryEnabled = this.settings.SENTRY_ENVIRONMENTS.includes(this.settings.NODE_ENV);

    // Only enabls the integration if pass minimun environment
    if (this.sentryEnabled) {
      Sentry.init({
        dsn: this.settings.SENTRY_DSN,
        environment: this.settings.NODE_ENV,
        integrations: (ints) => ints.filter((i) => i.name !== 'OnUncaughtException'),
      });
      this.success('Sentry integration ONLINE', { localOnly: true });
    }
    else {
      this.warning('Sentry integration OFFLINE', { localOnly: true });
    }

    // Logs any uncaught exception as error
    process.on('uncaughtException', (err) => {
      this.error(err, { unexpected: true });
    });
  }

  /**
   * Given a logged event by the application, translate its properties into
   * the API standards according to message type being an error or string
   * @param params
   */
  private async log(params: LoggerParams): Promise<void> {
    try {

      // If data is present but is not an object, make it one
      if (params.data && typeof params.data !== 'object') params.data = { data: params.data };

      // If level is error or higher but there is no error object, we must create it.
      // Make sure to remove the top 2 stack traces since they reference this module
      if (
        params.level <= Math.max(LoggerLevel.ERROR, this.settings.SENTRY_MINIMUM_LEVEL)
        && !(params.message instanceof Error)
      ) {
        params.message = new Error(params.message);
        const stack = params.message.stack.split('\n');
        stack.splice(1, 2);
        params.message.stack = stack.join('\n');
      }

      // Create separate entities for the error object (if present) and the message string
      params.error = params.message instanceof Error ? params.message : undefined;
      params.message = params.message instanceof Error
        ? params.message.message.replace('Error: ', '')
        : params.message;

      // Create separate stringified stack
      params.stack = params.error
        ? `at ${params.error.stack.split(' at ').splice(1).map((str) => str.replace(/\s+/g, ' ').trim()).join('\nat ')}`
        : undefined;

      // Logs the error locally and publish on cloud services
      this.printLog(params);
      await this.publishLog(params);
    }

    // Catch exceptions during the loggin procedure
    // This should never happen unless connection is lost and Sentry upload fails
    catch (e) {
      e.message = `Logger: Exception during event logging - ${e.message}`;
      if (this.sentryEnabled) Sentry.captureException(e);
      console.error(e);
    }
  }

  /**
   * Print messages in the console:
   * - STAGING & PRODUCTION: prints at stderr and only for WARNING+
   * - DEVELOPMENT: prints as colored string for any level
   * @param params
   */
  private printLog(params: LoggerParams): void {
    const nowStr = moment().format('YYYY-MM-DD HH:mm:ss');

    if (this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
      console.log(chalk`{grey ${nowStr}} {${params.labelColor}  ${params.label} } {${params.messageColor} ${params.message}}`);
      if (params.stack) console.log(chalk`{${params.messageColor} ${params.stack}}`);
      if (params.data && !params.data.localOnly) console.log(params.data);
    }
    else if (params.level <= LoggerLevel.WARNING) {
      console.log(`${nowStr}  ${params.label}  ${params.message}`);
      if (params.error) console.error(params.error);
      if (params.data && !params.data.localOnly) console.log(params.data);
    }
  }

  /**
   * Publish events of Sentry according to minimun configured level
   * @param params
   */
  private async publishLog(params: LoggerParams): Promise<void> {
    if (params.data && params.data.localOnly) return undefined;

    if (this.sentryEnabled && params.level <= this.settings.SENTRY_MINIMUM_LEVEL) {
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

  /** CRITICAL - Display as red */
  public async critical(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.CRITICAL,
      labelColor: 'white.bgRed',
      messageColor: 'red',
      label: 'CRT',
      message,
      data,
    });
  }

  /** ERROR - Display as red */
  public async error(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.ERROR,
      labelColor: 'black.bgRed',
      messageColor: 'red',
      label: 'ERR',
      message,
      data,
    });
  }

  /** WARNING - Display as yellow */
  public async warning(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.WARNING,
      labelColor: 'black.bgYellow',
      messageColor: 'yellow',
      label: 'WRN',
      message,
      data,
    });
  }

  /** INFO (Generic) - Display as white */
  public async info(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgWhite',
      messageColor: 'white',
      label: 'INF',
      message,
      data,
    });
  }

  /** INFO (Success) - display as green */
  public async success(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgGreen',
      messageColor: 'green',
      label: 'INF',
      message,
      data,
    });
  }

  /** INFO (HTTP) - display as cyan */
  public async server(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.INFO,
      labelColor: 'black.bgCyan',
      messageColor: 'cyan',
      label: 'INF',
      message,
      data,
    });
  }

  /** DEBUG - Display as grey */
  public async debug(message: string | Error, data?: any): Promise<void> {
    await this.log({
      level: LoggerLevel.DEBUG,
      labelColor: 'black.bgBlue',
      messageColor: 'grey',
      label: 'DBG',
      message,
      data,
    });
  }

}
