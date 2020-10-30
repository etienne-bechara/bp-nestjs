import { Injectable } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { AuthStrategy } from './auth.enum';

@Injectable()
export class AuthConfig {

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(AuthStrategy))
  public readonly AUTH_STRATEGY: string;

  @InjectSecret()
  @ValidateIf((o) => o.AUTH_STRATEGY)
  @IsString() @IsNotEmpty()
  public readonly AUTH_KEY: string;

}
