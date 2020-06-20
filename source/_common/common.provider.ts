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
    this.log.debug(
      `${params.method}(): running with ${params.retries || 'infinite'} retries and ${params.timeout || 'infinite'} timeout...`,
      { args: params.args },
    );

    const startTime = new Date().getTime();
    let tentatives = 1;
    let result;

    while (!result) {
      try {
        result = await params.instance[params.method](...params.args);
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (params.retries && tentatives > params.retries) throw e;
        else if (params.timeout && elapsed > params.timeout) throw e;
        else if (params.validateRetry && !params.validateRetry(e)) throw e;
        tentatives++;

        this.log.debug(`${params.method}(): ${e.message}. Retrying #${tentatives}, elapsed ${elapsed}ms...`);
        await this.wait(params.delay || 0);
      }
    }

    this.log.debug(`${params.method}() finished successfully!`);
    return result;
  }

}
