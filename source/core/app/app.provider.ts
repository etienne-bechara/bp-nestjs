/* eslint-disable no-constant-condition */

import { LoggerService } from '../logger/logger.service';
import { AppRetryParams } from './app.interface';
import { AppUtils } from './app.utils';

export abstract class AppProvider {
  protected logger: LoggerService = AppUtils.getLogger();

  /** Reads desired settings and type them accordingly */
  protected getSettings<T>(): T {
    return AppUtils.parseSettings<T>();
  }

  /** Wait for desired milliseconds */
  protected async halt(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout
   * @param params
   */
  protected async retryOnException<T>(params: AppRetryParams): Promise<T> {
    const p = params;
    this.logger.debug(`${p.method}(): running with ${p.retries || 'infinite'} retries and ${p.timeout / 1000 || 'infinite '}s timeout...`);

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
        else if (p.breakIf && p.breakIf(e)) throw e;
        tentatives++;

        this.logger.debug(`${p.method}(): ${e.message} | Retry #${tentatives}/${p.retries || 'infinite'}, elapsed ${elapsed / 1000}/${p.timeout / 1000 || 'infinite '}s...`);
        await this.halt(p.delay || 0);
      }
    }

    this.logger.debug(`${p.method}() finished successfully!`);
    return result;
  }

}
