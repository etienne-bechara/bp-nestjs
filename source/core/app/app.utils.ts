/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dotenv from 'dotenv';
import globby from 'globby';

import { Settings } from '../../settings';
import { LoggerService } from '../logger/logger.service';

let cachedSettings: Settings;
let loggerService: LoggerService;

export class AppUtils {

  /**
   * Given a glob path string, find all matching files
   * and return an array of all required exports
   * @param globPath
   */
  public static globToRequire(globPath: string | string[], cwd: string = __dirname): any[] {
    const matchingFiles = globby.sync(globPath, { cwd });
    const exportsArrays = matchingFiles.map((file) => {
      const exportsObject = require(file);
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });
    return [].concat(...exportsArrays);
  }

  /**
   * Parses and validates environment varaibles then
   * join them with settings, then caches the result
   */
  public static getSettings(): Settings {
    if (!cachedSettings) {
      const rawEnv = dotenv.config({ path: `${__dirname}/../../.env` }).parsed || { };
      cachedSettings = plainToClass(Settings, rawEnv);
      validateOrReject(cachedSettings, {
        validationError: { target: false },
      })
        .catch((e) => {
          console.error(e);
          process.exit(1);
        });
    }
    return cachedSettings;
  }

  /**
   * Retuns the logger singleton instance, creates it
   * if not available
   */
  public static getLogger(): LoggerService {
    if (!loggerService) {
      loggerService = new LoggerService(this.getSettings());
    }
    return loggerService;
  }

}
