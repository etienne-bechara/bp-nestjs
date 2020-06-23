/* eslint-disable @typescript-eslint/no-explicit-any */

import { LoggerService } from '../_logger/logger.service';
import { logger, settings } from '../main';
import { Settings } from '../settings';
import { CommonRetryParams } from './interfaces/common.retry.params';

export class CommonProvider {

  /** Reads an env variable */
  public get settings(): Settings {
    return settings;
  }

  /** Returns the instance of logger service */
  public get log(): LoggerService {
    return logger;
  }

  /** Wait for desired milliseconds */
  public async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout
   * @param method
   * @param params
   */
  public async retry(params: CommonRetryParams): Promise<any> {
    const p = params;
    this.log.debug(`${p.method}(): running with ${p.retries || 'infinite'} retries and ${p.timeout / 1000 || 'infinite '}s timeout...`);

    const startTime = new Date().getTime();
    let tentatives = 1;
    let result;

    while (!result) {
      try {
        result = await p.instance[p.method](...p.args);
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (p.retries && tentatives > p.retries) throw e;
        else if (p.timeout && elapsed > p.timeout) throw e;
        else if (p.validateRetry && !p.validateRetry(e)) throw e;
        tentatives++;

        this.log.debug(`${p.method}(): ${e.message} | Retry #${tentatives}/${p.retries || 'infinite'}, elapsed ${elapsed / 1000}/${p.timeout / 1000 || 'infinite '}s...`);
        await this.wait(p.delay || 0);
      }
    }

    this.log.debug(`${p.method}() finished successfully!`);
    return result;
  }

}
