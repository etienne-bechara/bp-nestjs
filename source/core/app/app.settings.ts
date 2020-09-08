import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber } from 'class-validator';

import { AppEnvironment } from './app.enum';

export class AppSettings {

  /* Environment Variables */

  @IsIn(Object.keys(AppEnvironment))
  public NODE_ENV: AppEnvironment;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public PORT: number;

  /* Provider Options */

  public APP_JSON_LIMIT: string = '10mb';

  public APP_TIMEOUT: number = 90 * 1000;

  public APP_CORS_OPTIONS: CorsOptions | boolean = {
    origin: '*',
    methods: 'DELETE, GET, OPTIONS, POST, PUT',
    allowedHeaders: 'Accept, Authorization, Content-Type',
  };

  public APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

}
