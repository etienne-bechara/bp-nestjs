import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import globby from 'globby';

import { ConfigService } from '../config/config.service';
import { AppEnvironment } from './app.enum';

@Injectable()
export class AppConfig extends ConfigService {

  /* Environment Variables */
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @IsOptional()
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly PORT: number;

  /* Service Settings */
  public readonly APP_JSON_LIMIT = '10mb';

  public readonly APP_TIMEOUT = 90 * 1000;

  public readonly APP_CORS_OPTIONS: CorsOptions = {
    origin: '*',
    methods: 'DELETE, GET, OPTIONS, POST, PUT',
    allowedHeaders: 'Accept, Authorization, Content-Type',
  };

  /**
   * Given a glob path string, find all matching files
   * and return an array of all required exports.
   * @param globPath
   */
  public static globToRequire(globPath: string | string[]): any[] {
    globPath = Array.isArray(globPath) ? globPath : [ globPath ];

    // Validate glob path and go back two paths (to be at root)
    const globRootPath = globPath.map((p) => {
      if (!p.match(/^!?\.\//g)) throw new Error("glob paths must start with './' or '!./'");
      return p.replace(/^!\.\//, '!../../').replace(/^\.\//, '../../');
    });

    // Acquire matching files and remove .ts entries if .js is present
    let matchingFiles = globby.sync(globRootPath, { cwd: __dirname });
    const jsFiles = matchingFiles.filter((file) => file.match(/\.js$/g));
    matchingFiles = jsFiles.length > 0 ? jsFiles : matchingFiles;

    const exportsArrays = matchingFiles.map((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const exportsObject = require(file);
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });

    return [].concat(...exportsArrays);
  }

}
