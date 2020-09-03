import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class RedisSettings {

  /* Environment Variables */

  @IsOptional()
  @IsUrl()
  public REDIS_HOST: string;

  @ValidateIf((o) => !!o.REDIS_HOST)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public REDIS_PORT: number;

  @ValidateIf((o) => !!o.REDIS_HOST)
  @IsString()
  public REDIS_PASSWORD: string;

  /* Provider Options */

  public REDIS_KEY_PREFIX: string = '';

}
