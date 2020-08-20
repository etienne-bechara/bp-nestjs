import { Injectable, InternalServerErrorException } from '@nestjs/common';
import redis, { RedisClient } from 'redis';

import { AppProvider } from '../app/app.provider';
import { RedisKey } from './redis.enum';
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
   * Sets up the redis cloud client
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
   * When setting a key always stringify it to preserve
   * type information
   * @param key
   * @param value
   */
  public async setKey(key: RedisKey, value: unknown, expiration?: number): Promise<void> {
    this.checkRedisClient();

    const stringValue = JSON.stringify(value);
    this.logger.debug(`Redis: Setting key ${key} as ${stringValue}...`);

    return new Promise((resolve, reject) => {
      this.redisClient.set(key, stringValue, 'PX',
        expiration || this.settings.REDIS_DEFAULT_EXPIRATION,
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
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

}
