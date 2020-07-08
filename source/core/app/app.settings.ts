import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AppEnvironment } from './app.enum';

export class AppSettings {

  /* Environment Variables */

  @IsIn(Object.keys(AppEnvironment))
  public NODE_ENV: AppEnvironment;

  @Transform((v) => parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsOptional()
  @IsString() @IsNotEmpty()
  public APP_AUTHORIZATION: string;

  /* Provider Options */

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

}
