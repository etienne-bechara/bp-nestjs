import { Test } from '@nestjs/testing';

import { AppUtils } from '../app/app.utils';
import { RedisKey } from './redis.enum';
import { RedisService } from './redis.service';

AppUtils.describeIfEnv('REDIS_HOST', true, 'RedisService', () => {
  const rng = Math.random();
  let redisService: RedisService;

  beforeAll(async() => {
    const testModule = await Test.createTestingModule({
      providers: [ RedisService ],
    }).compile();

    redisService = testModule.get(RedisService);
  });

  describe('setKey', () => {
    it('should persist a random number', async() => {
      expect(await redisService.setKey(RedisKey.TEST_RANDOM_NUMBER, { rng }, 10 * 1000))
        .toBeUndefined();
    });
  });

  describe('getKey', () => {
    it('should read persisted random number', async() => {
      expect(await redisService.getKey(RedisKey.TEST_RANDOM_NUMBER))
        .toMatchObject({ rng });
    });
  });

});
