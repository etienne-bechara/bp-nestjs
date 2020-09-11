import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber } from 'class-validator';

import { AppEnvironment } from './app.enum';

export class AppSettings {

  /* Environment Variables */

  @IsIn(Object.keys(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly PORT: number;

  /* Provider Options */

  public readonly APP_JSON_LIMIT: string = '10mb';

  public readonly APP_TIMEOUT: number = 90 * 1000;

  public readonly APP_CORS_OPTIONS: CorsOptions | boolean = {
    origin: '*',
    methods: 'DELETE, GET, OPTIONS, POST, PUT',
    allowedHeaders: 'Accept, Authorization, Content-Type',
  };

  public readonly APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

}
