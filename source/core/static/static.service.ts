/* eslint-disable no-console */
import dotenv from 'dotenv';
import globby from 'globby';

/**
 * Wrapper of static methods used across application.
 */
export class StaticService {

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
      StaticService.describeSilent(name, fn);
    }
    else {
      describe(name, fn);
    }
  }

}
