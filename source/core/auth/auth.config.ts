import { Injectable } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { ConfigService } from '../config/config.service';
import { AuthStrategy } from './auth.enum';

@Injectable()
export class AuthConfig extends ConfigService {

  /* Environment Variables */
  @IsOptional()
  @IsIn(Object.values(AuthStrategy))
  public readonly AUTH_STRATEGY: string;

  @ValidateIf((o) => o.AUTH_STRATEGY)
  @IsString() @IsNotEmpty()
  public readonly AUTH_KEY: string;

}
