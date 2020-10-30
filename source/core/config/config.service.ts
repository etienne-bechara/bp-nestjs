/* eslint-disable @typescript-eslint/naming-convention */
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import dotenv from 'dotenv';

import { ConfigModuleOptions } from './config.interface/config.module.options';

/**
 * Cache lives as long the application is running.
 * Keys are always stored in upper case.
 */
const secretCache: Record<string, string> = { };

/**
 * Fully static service to manage environment
 * population, validation and cache creation.
 */
export class ConfigService {

  /**
   * Returns a secret value given its key.
   * Cache should already be populated.
   * @param key
   */
  public static getSecret(key: string): string {
    if (!key) return;
    return secretCache[key.toUpperCase()];
  }

  /**
   * Sets a secret, enforces upper case.
   * @param key
   * @param value
   */
  public static setSecret(key: string, value: string): void {
    if (!key) return;
    secretCache[key.toUpperCase()] = value;
  }

  /**
   * Orchestrates initial secret acquisition and storage.
   * This procedure should be called only once at the registration
   * of config module in your application.
   * @param options
   */
  public static async setupSecretEnvironment(options: ConfigModuleOptions = { }): Promise<ValidationError[]> {
    this.loadInitialEnvironment(options.envPath);
    await this.populateSecretCache(options);
    const validationErrors = this.validateConfigs(options.configs);

    if (validationErrors.length > 0 && !options.allowValidationErrors) {
      console.error(...validationErrors); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    }
    else if (validationErrors.length > 0) {
      console.warn(...validationErrors); // eslint-disable-line no-console
    }

    return validationErrors;
  }

  /**
   * If an env file is provided, merge current process environment
   * with it. In case of collision, give priority to file key.
   * @param envPath
   */
  private static loadInitialEnvironment(envPath: string): void {
    if (!envPath) return;
    const envFile = dotenv.config({ path: envPath }).parsed || { };
    process.env = { ...process.env, ...envFile };
  }

  /**
   * Given provided configuration classes, read properties decorated
   * with InjectedSecret and caches their key/value pairs.
   * @param options
   */
  private static async populateSecretCache(options: ConfigModuleOptions): Promise<void> {
    const desiredSecrets = this.resolveDesiredSecrets(options.configs);

    await Promise.all(desiredSecrets.map((secretKey) => {
      let secretValue = null;

      if (process.env[secretKey]) {
        secretValue = process.env[secretKey];
      }

      this.setSecret(secretKey, secretValue);
    }));
  }

  /**
   * Given an array of config classes, instantiate them to resolve
   * the injection decorator and return all desired secret keys.
   * @param configs
   */
  private static resolveDesiredSecrets(configs: any[]): string[] {
    if (!configs) return [ ];
    const desiredSecrets: string[] = [ ];

    for (const ConfigClass of configs) {
      const dummyInstance = new ConfigClass();

      for (const key in dummyInstance) {
        const keyValue = dummyInstance[key];

        if (typeof keyValue === 'string' && keyValue.startsWith('secret://')) {
          desiredSecrets.push(keyValue.replace('secret://', ''));
        }
      }
    }

    return desiredSecrets;
  }

  /**
   * Validates provided config classes against current secret cache
   * using rules from class-validator and class-transformer.
   * @param configs
   */
  private static validateConfigs(configs: any[]): ValidationError[] {
    const validationErrors: ValidationError[] = [ ];

    for (const ConfigClass of configs) {
      const validationInstance = plainToClass(ConfigClass, secretCache);
      const partialErrors = validateSync(validationInstance, {
        validationError: { target: false },
      });

      if (partialErrors && partialErrors.length > 0) {
        validationErrors.push(...partialErrors);
      }
    }

    return validationErrors;
  }

}
