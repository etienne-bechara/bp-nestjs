import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsUrl } from 'class-validator';

export class RedisConfig {

  /* Environment Variables */

  @IsUrl()
  public readonly REDIS_HOST: string;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly REDIS_PORT: number;

  @IsString()
  public readonly REDIS_PASSWORD: string;

  /* Provider Options */

  public readonly REDIS_KEY_PREFIX: string = '';

}
