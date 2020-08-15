/* eslint-disable @typescript-eslint/unbound-method */

import { LoggerService } from '../logger/logger.service';
import { AppSharedUtils } from './app.interface';
import { AppUtils } from './app.utils';

export abstract class AppProvider {
  protected logger: LoggerService = AppUtils.getLogger();

  /**
   * Reads desired settings and type them accordingly
   */
  protected getSettings<T>(): T {
    return AppUtils.parseSettings<T>();
  }

  /**
   * Returns an allowed set of utilities from application
   */
  protected get utils(): AppSharedUtils {
    return {
      halt: AppUtils.halt,
      retryOnException: AppUtils.retryOnException,
    };
  }

}
