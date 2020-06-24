import { ValidationPipeOptions } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

import { AppEnvironment } from '../_app/app.enum';
import { LoggerLevel } from '../_logger/logger.enum';

/**
 * All Setting will be avaiable at `this.settings`
 * when extending the `CommonProvider`
 */
export class CommonSettings {

  /**
   * BOILERPLATE ENVIRONMENT VARIABLES
   */
  @IsEnum(AppEnvironment)
  public NODE_ENV: AppEnvironment;

  @Transform((v) => parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsString()
  public APP_AUTHORIZATION: string;

  @IsOptional()
  @IsUrl()
  public SENTRY_DSN: string;

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
  @IsIn([
    'mysql', 'mariadb', 'postgres', 'cockroachdb', 'sqlite', 'mssql',
    'sap', 'oracle', 'cordova', 'nativescript', 'react-native', 'sqljs',
    'mongodb', 'aurora-data-api', 'aurora-data-api-pg', 'expo',
  ])
  public APP_ORM_TYPE: any; // eslint-disable-line

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public APP_ORM_HOST: string;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public APP_ORM_PORT: number;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public APP_ORM_USERNAME: string;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @IsString()
  public APP_ORM_PASSWORD: string;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @IsNotEmpty()
  @IsString()
  public APP_ORM_DATABASE: string;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @Transform((v) => v === 'true')
  public APP_ORM_SYNCHRONIZE: boolean;

  @ValidateIf((o) => o.APP_ORM_TYPE)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public APP_ORM_POOL_LIMIT: number;

  /**
   * BOILERPLATE GENERAL OPTIONS
   */
  public APP_TIMEOUT: number = 2 * 60 * 1000;
  public APP_INTERFACE: string = '0.0.0.0';
  public APP_ENABLE_CORS: boolean = true;

  public APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  public HTTPS_DEFAULT_TIMEOUT: number = 60 * 1000;

  public REDIS_DEFAULT_EXPIRATION: number = 1 * 24 * 60 * 60 * 1000;

  public SENTRY_ENVIRONMENTS: AppEnvironment[] = [ AppEnvironment.PRODUCTION, AppEnvironment.STAGING ];
  public SENTRY_MINIMUM_LEVEL: LoggerLevel = LoggerLevel.ERROR;

}
