import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { AuthStrategy } from './auth.enum';

export class AuthSettings {

  /* Environment Variables */

  @IsOptional()
  @IsIn(Object.keys(AuthStrategy))
  public AUTH_STRATEGY: string;

  @ValidateIf((o) => o.AUTH_STRATEGY)
  @IsString() @IsNotEmpty()
  public AUTH_KEY: string;

}
