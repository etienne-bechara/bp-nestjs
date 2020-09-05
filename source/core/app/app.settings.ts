import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

import { AppAuthStrategy, AppEnvironment } from './app.enum';

export class AppSettings {

  /* Environment Variables */

  @IsIn(Object.keys(AppEnvironment))
  public NODE_ENV: AppEnvironment;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsIn(Object.keys(AppAuthStrategy))
  public AUTH_GLOBAL_STRATEGY: string;

  @ValidateIf((o) => o.AUTH_GLOBAL_STRATEGY === AppAuthStrategy.STATIC_TOKEN)
  @IsString() @IsNotEmpty()
  public AUTH_STATIC_TOKEN: string;

  @ValidateIf((o) => o.AUTH_GLOBAL_STRATEGY === AppAuthStrategy.JWT_HS256)
  @IsString() @IsNotEmpty()
  public AUTH_JWT_HS256_CLIENT_SECRET: string;

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
