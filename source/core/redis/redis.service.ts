import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { LoggerService } from '../logger/logger.service';
import { RedisConfig } from './redis.config';
import { RedisKey } from './redis.enum';
import { RedisSetParams } from './redis.interface';

@Injectable()
export class RedisService {

  private redisClient: Redis.Redis;

  public constructor(
    private readonly redisConfig: RedisConfig,
    private readonly loggerService: LoggerService,
  ) {
    this.setupRedis();
  }

  /**
   * Sets up the redis cloud client, in case of ECONNRESET
   * errors attempt to reconnect up to 5 times with a delay
   * of 100ms. On failure throws regular exception.
   */
  private setupRedis(): void {
    const redisHost = this.redisConfig.REDIS_HOST;
    this.redisClient = new Redis({
      host: redisHost,
      port: this.redisConfig.REDIS_PORT,
      password: this.redisConfig.REDIS_PASSWORD,
      keyPrefix: this.redisConfig.REDIS_KEY_PREFIX,
      reconnectOnError: (err: Error): boolean | 1 | 2 => {
        this.loggerService.error(err);
        return 2;
      },
    });

    this.loggerService.notice(`Redis client connected at ${redisHost}`);
  }

  /**
   * Reads given key and parse its value.
   * @param key
   */
  public async getKey<T>(key: RedisKey): Promise<T> {
    this.loggerService.debug(`Redis: Reading key ${key}...`);

    const stringValue = await this.redisClient.get(key);
    return JSON.parse(stringValue);
  }

  /**
   * When setting a key always stringify it to preserve
   * type information.
   * @param params
   */
  public async setKey(params: RedisSetParams): Promise<void> {
    const extraParams = [ ];

    if (params.skip === 'IF_EXIST') extraParams.push('NX');
    if (params.skip === 'IF_NOT_EXIST') extraParams.push('XX');

    if (params.keepTtl) {
      extraParams.push('KEEPTTL');
    }
    else if (params.duration) {
      extraParams.push('PX');
      extraParams.push(params.duration);
    }

    this.loggerService.debug(`Redis: Setting key ${params.key}...`);

    await this.redisClient.set(
      params.key,
      JSON.stringify(params.value),
      ...extraParams,
    );
  }

  /**
   * Deletes desired key.
   * @param key
   */
  public async delKey(key: RedisKey): Promise<void> {
    await this.redisClient.del(key);
  }

}
