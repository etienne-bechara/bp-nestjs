import { CommonSettings } from './_common/common.settings';

/**
 * Import all non-boilerplate controllers into this array
 */
export const Controllers = [

];

/**
 * Import all non-boilerplate services, guards and middlewares into this array
 */
export const Providers = [

];

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `CommonProvider`
 */
export class Settings extends CommonSettings {

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
   * • The value is the same across environments
   *
   * How to use:
   * • Create a property here with value and type definition
   * • Do not apply any decorator
   */

  // Example:
  // public MY_GENERIC_STRING: string = 'hello';

}
