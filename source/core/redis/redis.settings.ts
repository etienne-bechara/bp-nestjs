import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class RedisSettings {

  /* Environment Variables */

  @IsOptional()
  @IsUrl()
  public readonly REDIS_HOST: string;

  @ValidateIf((o) => !!o.REDIS_HOST)
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly REDIS_PORT: number;

  @ValidateIf((o) => !!o.REDIS_HOST)
  @IsString()
  public readonly REDIS_PASSWORD: string;

  /* Provider Options */

  public readonly REDIS_KEY_PREFIX: string = '';

}
