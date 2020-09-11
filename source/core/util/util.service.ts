/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dotenv from 'dotenv';
import globby from 'globby';
import os from 'os';

import { AppEnvironment } from '../app/app.enum';
import { AppRetryParams } from '../app/app.interface';
import { AppProvider } from '../app/app.provider';
import { AppSettings } from '../app/app.settings';
import { LoggerService } from '../logger/logger.service';
import { LoggerSettings } from '../logger/logger.settings';
import { UtilAppStatus } from './util.interface';

let cachedSettings: any;
let loggerService: LoggerService;

@Injectable()
export class UtilService extends AppProvider {

  /**
   * Given a glob path string, find all matching files
   * and return an array of all required exports.
   *
   * Always use runtime root as entry point.
   * @param globPath
   */
  public static globToRequire(globPath: string | string[]): any[] {
    globPath = Array.isArray(globPath) ? globPath : [ globPath ];

    const globRootPath = globPath.map((p) => {
      if (!p.startsWith('./') && !p.startsWith('!./')) {
        throw new Error("glob paths must start with './' or '!./'");
      }
      return p.replace(/^!\.\//, '!../../').replace(/^\.\//, '../../');
    });

    const matchingFiles = globby.sync(globRootPath, { cwd: __dirname });
    const exportsArrays = matchingFiles.map((file) => {
      const exportsObject = require(file);
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });

    return [].concat(...exportsArrays);
  }

  /**
   * Parses and validates environment variables then
   * join them with settings and caches the result.
   *
   * At development environment enable reverse mapping
   * of js files for easier stack debugging.
   */
  public static parseSettings<T>(): T {

    if (!cachedSettings) {
      const rawEnv = dotenv.config({ path: `${__dirname}/../../../.env` }).parsed || { };
      const settingsConstructors = UtilService.globToRequire('./**/*.settings.{js,ts}');
      const settings: any = { };

      for (const constructor of settingsConstructors) {
        const partialSettings: Record<string, unknown> = plainToClass(constructor, rawEnv);

        validateOrReject(partialSettings, { validationError: { target: false } })
          .catch((e) => {
            console.error(e);
            process.exit(1);
          });

        for (const key in partialSettings) {
          settings[key] = partialSettings[key];
        }
      }

      cachedSettings = settings;

      if (cachedSettings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
        require('source-map-support').install();
      }
    }
    return cachedSettings;
  }

  /**
   * Runs a test group mocking console.log and console.info.
   * @param name
   * @param fn
   */
  public static describeSilent(name: string, fn: any): void {
    console.log = jest.fn();
    console.info = jest.fn();
    fn();
  }

  /**
   * Describes a test only if desired environment variable
   * is present.
   * @param variable
   * @param silent
   * @param name
   * @param fn
   */
  public static describeIfEnv(variable: string, silent: boolean, name: string, fn: jest.EmptyFunction): void {
    const variableExists = dotenv.config().parsed[variable];
    if (!variableExists) {
      describe.skip(name, fn);
    }
    else if (silent) {
      UtilService.describeSilent(name, fn);
    }
    else {
      describe(name, fn);
    }
  }

  /**
   * Retuns the logger singleton instance, creates it
   * if not available.
   */
  public static getLoggerService(): LoggerService {
    if (!loggerService) {
      loggerService = new LoggerService(
        UtilService.parseSettings<AppSettings & LoggerSettings>(),
      );
    }
    return loggerService;
  }

  /**
   * Asynchronously wait for desired amount of milliseconds.
   * @param ms
   */
  public async halt(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  public async retryOnException<T>(params: AppRetryParams): Promise<T> {
    const p = params;

    let msg = `${p.method}(): running with ${p.retries || '∞'} `;
    msg += `retries and ${p.timeout / 1000 || '∞ '}s timeout...`;
    this.logger.debug(msg);

    const startTime = new Date().getTime();
    let tentatives = 1;
    let result: T;

    while (true) {
      try {
        result = await p.instance[p.method](...p.args);
        break;
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (p.retries && tentatives > p.retries) throw e;
        else if (p.timeout && elapsed > p.timeout) throw e;
        else if (p.breakIf?.(e)) throw e;
        tentatives++;

        msg = `${p.method}(): ${e.message} | Retry #${tentatives}/${p.retries || '∞'}`;
        msg += `, elapsed ${elapsed / 1000}/${p.timeout / 1000 || '∞ '}s...`;
        this.logger.debug(msg);

        await this.halt(p.delay || 0);
      }
    }

    this.logger.debug(`${p.method}() finished successfully!`);
    return result;
  }

  /**
   * Reads data regarding current runtime and networ.
   */
  public async readAppStatus(): Promise<UtilAppStatus> {
    const publicIp = { v4: null, v6: null };

    try {
      const { data } = await axios.get('https://api.ipify.org');
      publicIp.v4 = data;
    }
    catch (e) {
      this.logger.error(e);
    }

    try {
      const { data } = await axios.get('https://api6.ipify.org');
      publicIp.v6 = data;
    }
    catch (e) {
      this.logger.error(e);
    }

    return {
      system: {
        version: os.version(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch(),
        endianness: os.endianness(),
        uptime: os.uptime(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus(),
      network: {
        public_ipv4: publicIp.v4,
        public_ipv6: publicIp.v6,
        interfaces: os.networkInterfaces(),
      },
    };
  }

}
