import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber } from 'class-validator';
import globby from 'globby';

import { AppEnvironment } from './app.enum';

export class AppConfig {

  /* Environment Variables */
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

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
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const exportsObject = require(file);
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });

    return [].concat(...exportsArrays);
  }

}
