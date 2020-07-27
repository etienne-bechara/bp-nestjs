/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dotenv from 'dotenv';
import globby from 'globby';

import { LoggerService } from '../../logger/logger.service';
import { LoggerSettings } from '../../logger/logger.settings';
import { AppEnvironment } from '../app.enum';
import { AppSettings } from '../app.settings';

let cachedSettings: any;
let loggerService: LoggerService;

export class AppUtils {

  /**
   * Given a glob path string, find all matching files
   * and return an array of all required exports
   *
   * Always use runtime root as entry point
   * @param globPath
   */
  public static globToRequire(globPath: string | string[]): any[] {
    globPath = Array.isArray(globPath) ? globPath : [ globPath ];

    const globRootPath = globPath.map((p) => {
      if (!p.startsWith('./') && !p.startsWith('!./')) {
        throw new Error("glob paths must start with './' or '!./'");
      }
      return p.replace(/^!\.\//, '!../../../').replace(/^\.\//, '../../../');
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
   * join them with settings and caches the result
   *
   * At development environment enable reverse mapping
   * of js files for easier stack debugging
   */
  public static parseSettings<T>(): T {

    if (!cachedSettings) {
      const rawEnv = dotenv.config({ path: `${__dirname}/../../../../.env` }).parsed || { };
      const settingsConstructors = this.globToRequire('./**/*.settings.js');
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
   * Retuns the logger singleton instance, creates it
   * if not available
   */
  public static getLogger(): LoggerService {
    if (!loggerService) {
      loggerService = new LoggerService(
        this.parseSettings<AppSettings & LoggerSettings>(),
      );
    }
    return loggerService;
  }

}
