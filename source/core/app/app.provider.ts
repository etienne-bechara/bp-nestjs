/* eslint-disable @typescript-eslint/unbound-method */

import { LoggerService } from '../logger/logger.service';
import { UtilService } from '../util/util.service';

export abstract class AppProvider {
  protected logger: LoggerService = UtilService.getLoggerService();

  /**
   * Reads desired settings and type them accordingly.
   */
  protected getSettings<T>(): T {
    return UtilService.parseSettings<T>();
  }

}
