import { ValidationPipeOptions } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

import { AppEnvironment } from './_app/app.enum';
import { LoggerLevel } from './_logger/logger.enum';

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `CommonProvider`
 */
export class Settings {

  /**
   * ENVIRONMENT VARIABLES
   *
   * How to use:
   * • Must be declared in .env file at root folder
   * • Everything load as string, use class-transformer to apply typing
   * • Use class-validator decorators to apply validation rules
   * • Failed validations will exit application with status code 1
   *
   * Add properties here if:
   * • The value is considered sensitive data
   * • The value changes according to environment
   */

  @IsEnum(AppEnvironment)
  public NODE_ENV: AppEnvironment;

  @Transform((v) => parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsString()
  public APP_AUTHORIZATION: string;

  @IsUrl()
  public SENTRY_DSN: string;

  /**
   * GENERAL OPTIONS
   *
   * Provides a centralized location to change any common setting
   *
   * Add properties here if:
   * • The value does not contain sensitive information
   * • The value is the same across environments
   */

  public APP_TIMEOUT: number = 2 * 60 * 1000;
  public APP_INTERFACE: string = '0.0.0.0';
  public APP_ENABLE_CORS: boolean = true;
  public APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  public SENTRY_ENVIRONMENTS: AppEnvironment[] = [ AppEnvironment.PRODUCTION, AppEnvironment.STAGING ];
  public SENTRY_MINIMUM_LEVEL: LoggerLevel = LoggerLevel.ERROR;

  public HTTPS_DEFAULT_TIMEOUT: number = 20 * 1000;
  public HTTPS_DEFAULT_USER_AGENT: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML; like Gecko) Chrome/83.0.4103.61 Safari/537.36';

}
