import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsUrl } from 'class-validator';

import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisConfig extends ConfigService {

  /* Environment Variables */
  @IsUrl()
  public readonly REDIS_HOST: string;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly REDIS_PORT: number;

  @IsString()
  public readonly REDIS_PASSWORD: string;

  /* Service Settings */
  public readonly REDIS_KEY_PREFIX = '';

  public readonly REDIS_LOCK_DEFAULT_DURATION = 5000;

}
