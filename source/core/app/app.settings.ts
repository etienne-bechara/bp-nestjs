/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

import { LoggerLevel } from '../logger/logger.enum';
import { AppEnvironment } from './app.enum';

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `AbstractProvider`
 */
export class AppSettings {

  /**
   * BOILERPLATE ENVIRONMENT VARIABLES
   */
  @IsEnum(AppEnvironment)
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
  @IsUrl()
  public REDIS_HOST: string;

  @ValidateIf((o) => o.REDIS_HOST)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public REDIS_PORT: number;

  @ValidateIf((o) => o.REDIS_HOST)
  @IsOptional()
  @IsString()
  public REDIS_PASSWORD: string;

  @IsOptional()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @ValidateIf((o) => o.ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public ORM_HOST: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public ORM_PORT: number;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public ORM_USERNAME: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsString()
  public ORM_PASSWORD: string;

  @ValidateIf((o) => o.ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public ORM_DATABASE: string;

  /**
   * BOILERPLATE PROVIDER OPTIONS
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

}
