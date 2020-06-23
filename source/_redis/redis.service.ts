import { Injectable } from '@nestjs/common';
import redis, { RedisClient } from 'redis';

import { CommonProvider } from '../_common/common.provider';

@Injectable()
export class RedisService extends CommonProvider {
  private redisEnabled: boolean;
  private redisClient: RedisClient;

  /** */
  public constructor() {
    super();
    this.setupRedis();
  }

  /**
   * Sets up the redis cloud connection
   */
  private setupRedis(): void {
    this.redisEnabled = this.settings.REDIS_HOST ? true : false;

    if (!this.redisEnabled) {
      this.log.warning('Redis integration OFFLINE', { localOnly: true });
      return undefined;
    }

    this.redisClient = redis.createClient({
      host: this.settings.REDIS_HOST,
      port: this.settings.REDIS_PORT,
      password: this.settings.REDIS_PASSWORD,
    });

    this.log.success('Redis integration ONLINE', { localOnly: true });
  }

  /**
   * When setting a key always stringify it to preserve
   * type information
   * @param key
   * @param value
   */
  public async setKey(key: string, value: unknown, expiration?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.set(
        key,
        JSON.stringify(value),
        'PX',
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
  public async getKey(key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, reply) => {
        if (err) reject(err);
        else resolve(JSON.parse(reply));
      });
    });
  }

}
