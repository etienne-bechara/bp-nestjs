/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

import { AppEnvironment } from './core/app/app.enum';
import { LoggerLevel } from './core/logger/logger.enum';

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `AbstractProvider`
 */
export class Settings {

  /**
   * PROVIDERS OPTIONS
   *
   * When to use:
   * • The value does not contain sensitive information
   * • The value is the same across all environments
   *
   * How to use:
   * • Create a property here with value and type definition
   * • Do not apply any decorator
   */

  public APP_TIMEOUT: number = 2 * 60 * 1000;

  public APP_CORS_OPTIONS: CorsOptions | boolean = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Accept',
  };

  public APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  public ORM_POOL_MIN: number = 5;
  public ORM_POOL_MAX: number = 25;

  public HTTPS_DEFAULT_TIMEOUT: number = 60 * 1000;

  public REDIS_DEFAULT_EXPIRATION: number = 1 * 24 * 60 * 60 * 1000;

  public LOGGER_SENTRY_MINIMUM_LEVEL: LoggerLevel = LoggerLevel.ERROR;
  public LOGGER_SENTRY_ENVIRONMENTS: AppEnvironment[] = [
    AppEnvironment.PRODUCTION,
    AppEnvironment.STAGING,
  ];

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

  @IsIn(Object.keys(AppEnvironment))
  public NODE_ENV: AppEnvironment;

  @Transform((v) => parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public APP_AUTHORIZATION: string;

  @IsOptional()
  @IsUrl()
  public LOGGER_SENTRY_DSN: string;

  @IsOptional()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @ValidateIf((o) => o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_HOST: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public ORM_PORT: number;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_USERNAME: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsString()
  public ORM_PASSWORD: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_DATABASE: string;

  @IsOptional()
  @IsUrl()
  public REDIS_HOST: string;

  @ValidateIf((o) => o.REDIS_HOST)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public REDIS_PORT: number;

  @ValidateIf((o) => o.REDIS_HOST)
  @IsString()
  public REDIS_PASSWORD: string;

  @IsOptional()
  @IsUrl()
  public MAILER_HOST: string;

  @ValidateIf((o) => o.MAILER_HOST)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public MAILER_PORT: number;

  @ValidateIf((o) => o.MAILER_HOST)
  @IsString() @IsNotEmpty()
  public MAILER_USERNAME: string;

  @ValidateIf((o) => o.MAILER_HOST)
  @IsString() @IsNotEmpty()
  public MAILER_PASSWORD: string;

}
