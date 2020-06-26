/* eslint-disable @typescript-eslint/no-explicit-any */

import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate } from 'class-validator';

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
   * Validates an object across desired type
   * Returns an array of failed constraints
   * @param object
   * @param type
   */
  public async validate(object: unknown, type: ClassType<unknown>): Promise<string[]> {
    const plainObj = plainToClass(type, object);
    const errors = await validate(plainObj, this.settings.APP_VALIDATION_RULES);
    const constraints = [ ];

    for (const e of errors) {
      if (e.children) {
        e.children = e.children.map((c) => {
          return { parent: e.property, ...c };
        });
        errors.push(...e.children);
      }
      if (e.constraints) {
        let partials = Object.values(e.constraints);
        if (e['parent']) {
          partials = partials.map((p) => `${e['parent']}: ${p}`);
        }
        constraints.push(...partials);
      }
    }
    return constraints;
  }

  /**
   * Unflatten an object with nested entities by transforming
   * keys in {name}_id standard to name: { id: string | number}
   * @param object
   */
  public async unflatten(object: unknown): Promise<void> {
    Object.keys(object).map((key) => {
      if (key.endsWith('_id')) {
        object[key.slice(0, -3)] = { id: object[key] };
        delete object[key];
      }
    });
  }

  /**
   * Retry a method for configured times or until desired timeout
   * @param params
   */
  public async retry(params: AbstractRetryParams): Promise<any> {
    const p = params;
    this.logger.debug(`${p.method}(): running with ${p.retries || 'infinite'} retries and ${p.timeout / 1000 || 'infinite '}s timeout...`);

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

        this.logger.debug(`${p.method}(): ${e.message} | Retry #${tentatives}/${p.retries || 'infinite'}, elapsed ${elapsed / 1000}/${p.timeout / 1000 || 'infinite '}s...`);
        await this.wait(p.delay || 0);
      }
    }

    this.logger.debug(`${p.method}() finished successfully!`);
    return result;
  }

}
