/* eslint-disable @typescript-eslint/naming-convention */
import { ConfigService } from './config.service';

/**
 * Change the get behaviour of decorated property to return
 * the desired key from secret cache.
 *
 * If not yet available, provide a pseudo path that should
 * be interpreted by secret service when building its path.
 * @param key
 */
export function InjectSecret(key?: string): any {
  return function (target: any, propertyKey: string): void {
    if (!key) key = propertyKey;
    const pseudoPath = `secret://${key}`;
    target[propertyKey] = pseudoPath;

    Object.defineProperty(target, propertyKey, {
      get: () => {
        return ConfigService.getSecret(key) !== undefined
          ? ConfigService.getSecret(key)
          : pseudoPath;
      },

      set: (value) => {
        ConfigService.setSecret(key, value);
      },
    });
  };
}
