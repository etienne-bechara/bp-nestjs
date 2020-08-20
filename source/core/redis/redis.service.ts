import { Injectable, InternalServerErrorException } from '@nestjs/common';
import redis, { RedisClient } from 'redis';

import { AppProvider } from '../app/app.provider';
import { RedisKey } from './redis.enum';
import { RedisSetParams } from './redis.interface';
import { RedisSettings } from './redis.settings';

@Injectable()
export class RedisService extends AppProvider {
  private settings: RedisSettings = this.getSettings();
  private redisClient: RedisClient;

  /** */
  public constructor() {
    super();
    this.setupRedis();
  }

  /**
   * Sets up the redis cloud client, in case of ECONNRESET
   * errors attempt to reconnect up to 5 times with a delay
   * of 100ms. On failure throws regular exception
   */
  private setupRedis(): void {

    if (!this.settings.REDIS_HOST) {
      this.logger.warning('[DISABLED] Redis client', { private: true });
      return undefined;
    }

    this.redisClient = redis.createClient({
      host: this.settings.REDIS_HOST,
      port: this.settings.REDIS_PORT,
      password: this.settings.REDIS_PASSWORD,
      retry_strategy: (options) => {
        if (
          options.error
          && options.error.code.includes('ECONNRESET')
          && options.attempt < 5
        ) {
          return 100;
        }
        return undefined;
      },
    });

    this.logger.success('[ENABLED] Redis client', { private: true });
  }

  /**
   * Throw if redis client is not enabled
   * Used at the beggining of all methods
   */
  private checkRedisClient(): void {
    if (!this.redisClient) {
      throw new InternalServerErrorException({
        message: 'Redis client is DISABLED',
      });
    }
  }

  /**
   * Reads given key and parse its value
   * @param key
   */
  public async getKey<T>(key: RedisKey): Promise<T> {
    this.checkRedisClient();
    this.logger.debug(`Redis: Reading key ${key}...`);

    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, reply) => {
        if (err) reject(err);
        else resolve(JSON.parse(reply));
      });
    });
  }

  /**
   * When setting a key always stringify it to preserve
   * type information
   * @param key
   * @param value
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

    this.logger.debug(`Redis: Setting key ${params.key}...`);

    return new Promise((resolve, reject) => {
      this.redisClient.set(
        params.key,
        JSON.stringify(params.value),
        ...extraParams,
        (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
  }

  /**
   * Deletes desired key
   * @param key
   */
  public async delKey(key: RedisKey): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.del(key, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

}
