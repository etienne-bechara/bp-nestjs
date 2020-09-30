import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { AuthStrategy } from './auth.enum';

export class AuthConfig {

  /* Environment Variables */

  @IsOptional()
  @IsIn(Object.values(AuthStrategy))
  public readonly AUTH_STRATEGY: string;

  @ValidateIf((o) => o.AUTH_STRATEGY)
  @IsString() @IsNotEmpty()
  public readonly AUTH_KEY: string;

}
