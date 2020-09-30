import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Redis from 'ioredis';

import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { RedisConfig } from './redis.config';
import { RedisKey } from './redis.enum';
import { RedisSetParams } from './redis.interface';

@Injectable()
export class RedisService {
  private redisClient: Redis.Redis;

  public constructor(
    private readonly configService: ConfigService<RedisConfig>,
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

    if (!this.configService.get('REDIS_HOST')) {
      this.loggerService.warning('[DISABLED] Redis client', { private: true });
      return;
    }

    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      keyPrefix: this.configService.get('REDIS_KEY_PREFIX'),
      reconnectOnError: (err: Error): boolean | 1 | 2 => {
        this.loggerService.error(err);
        return 2;
      },
    });

    this.loggerService.success('[ENABLED] Redis client', { private: true });
  }

  /**
   * Throw if redis client is not enabled
   * Used at the beggining of all methods.
   */
  private checkRedisClient(): void {
    if (!this.redisClient) {
      throw new InternalServerErrorException({
        message: 'Redis client is DISABLED',
      });
    }
  }

  /**
   * Reads given key and parse its value.
   * @param key
   */
  public async getKey<T>(key: RedisKey): Promise<T> {
    this.checkRedisClient();
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
    this.checkRedisClient();
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
