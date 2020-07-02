import { AppSettings } from './core/app/app.settings';

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `AbstractProvider`
 */
export class Settings extends AppSettings {

  /**
   * ENVIRONMENT VARIABLES
   *
   * When to use:
   * • The value is considered sensitive data
   * • The value changes according to environment
   *
   * How to use:
   * • Create a property here without value definition
   * • Add validation rules through 'class-validator' decorators
   * • Must be declared in .env file at root folder
   * • Everything loads as string, so use class-transformer to apply typing
   * • Failed validations will exit application with status code 1
   */

  // Example:
  // @Transform((v) => parseInt(v))
  // @IsNumber()
  // public MY_SECRET_NUMBER: number;

  /**
   * GENERAL OPTIONS
   *
   * When to use:
   * • The value does not contain sensitive information
   * • The value is the same across all environments
   *
   * How to use:
   * • Create a property here with value and type definition
   * • Do not apply any decorator
   */

  // Example:
  // public MY_GENERIC_STRING: string = 'hello';

}
