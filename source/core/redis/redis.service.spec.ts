import { Test } from '@nestjs/testing';

import { describeIfEnv } from '../test/test.utils';
import { RedisService } from './redis.service';

describeIfEnv('REDIS_HOST', true, 'RedisService', () => {
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
      expect(await redisService.setKey('TEST_KEY', { rng }, 10 * 1000))
        .toBeUndefined();
    });
  });

  describe('getKey', () => {
    it('should read persisted random number', async() => {
      expect(await redisService.getKey('TEST_KEY'))
        .toMatchObject({ rng });
    });
  });

});
