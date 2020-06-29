/* eslint-disable @typescript-eslint/no-explicit-any */

import { LoggerService } from '../_logger/logger.service';
import { logger, settings } from '../_main';
import { Settings } from '../settings';
import { AbstractRetryParams } from './interfaces/abstract.retry.params';

export class AbstractProvider {

  /** Reads an env variable */
  public get settings(): Settings {
    return settings;
  }

  /** Returns the instance of logger service */
  public get logger(): LoggerService {
    return logger;
  }

  /** Wait for desired milliseconds */
  public async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout
   * @param params
   */
  public async retry<T>(params: AbstractRetryParams): Promise<T> {
    const p = params;
    this.logger.debug(`${p.method}(): running with ${p.retries || 'infinite'} retries and ${p.timeout / 1000 || 'infinite '}s timeout...`);

    const startTime = new Date().getTime();
    let tentatives = 1;
    let result: T;

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

        this.logger.debug(`${p.method}(): ${e.message} | Retry #${tentatives}/${p.retries || 'infinite'}, elapsed ${elapsed / 1000}/${p.timeout / 1000 || 'infinite '}s...`);
        await this.wait(p.delay || 0);
      }
    }

    this.logger.debug(`${p.method}() finished successfully!`);
    return result;
  }

}
