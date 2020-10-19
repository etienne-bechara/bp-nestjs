import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import dotenv from 'dotenv';

import { AppEnvironment } from '../app/app.enum';

const initializedConfigs = [ ];

export abstract class ConfigService {

  public readonly NODE_ENV: AppEnvironment;

  /**
   * During construction, only allow each instance
   * to be called once.
   * This is used to prevent overflow due to mock
   * initialization from class-transformer.
   */
  public constructor() {
    const configName = this['constructor'].name;

    if (!initializedConfigs.includes(configName)) {
      initializedConfigs.push(configName);
      this.setupConfig();
    }
  }

  /**
   * Reads all variables related to this instance
   * and validate them.
   */
  protected setupConfig(): void {
    const envVariables = this.getEnvVariables();
    this.validateEnvVariables(envVariables);
    this.populateEnvVariables(envVariables);
  }

  /**
   * Acquires variables from environment, overwriting
   * them with .env file in case of collision.
   */
  protected getEnvVariables(): Record<string, any> {
    const envFile = dotenv.config({ path: `${__dirname}/../../../.env` }).parsed || { };
    const envProcess = process.env || { };
    return { ...envProcess, ...envFile };
  }

  /**
   * Validates provided environment variables against decorators
   * from class-validator, applying transformations from class-
   * transformer if any is present.
   * @param envVariables
   */
  protected validateEnvVariables(envVariables: Record<string, any>): void {
    const transformedClass = plainToClass(this['constructor'] as any, envVariables);

    const validationErrors = validateSync(transformedClass, {
      validationError: { target: false },
    });

    if (validationErrors.length > 0) {
      console.error(...validationErrors); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    }
  }

  /**
   * Given a set of valid environment variables, populates the
   * declared local one with its equivalent.
   * @param envVariables
   */
  protected populateEnvVariables(envVariables: Record<string, any>): void {
    for (const variable in envVariables) {
      if (envVariables[variable] || envVariables[variable] === 0) {
        this[variable] = envVariables[variable];
      }
    }
  }

}
