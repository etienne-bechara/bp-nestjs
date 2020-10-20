import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../test/test.service';
import { RedisConfig } from './redis.config';
import { RedisKey } from './redis.enum';
import { RedisService } from './redis.service';

TestService.createSandbox({
  name: 'RedisService',
  providers: [ RedisConfig, RedisService ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    const rng = Math.random();
    let redisService: RedisService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      redisService = testingModule.get(RedisService);
    });

    describe('setKey', () => {
      it('should obey skip if not exist rule', async () => {
        await redisService.setKey({
          key: RedisKey.TEST_RANDOM_NUMBER,
          value: { rng },
          skip: 'IF_NOT_EXIST',
        });
        const storedNumber = await redisService.getKey(RedisKey.TEST_RANDOM_NUMBER);
        expect(storedNumber).toBeNull();
      });

      it('should persist a random number without errors', async () => {
        expect(await redisService.setKey({
          key: RedisKey.TEST_RANDOM_NUMBER,
          value: { rng },
        }))
          .toBeUndefined();
      });

      it('should obey skip if exist rule', async () => {
        await redisService.setKey({
          key: RedisKey.TEST_RANDOM_NUMBER,
          value: Math.random(),
          skip: 'IF_EXIST',
        });
        const storedNumber = await redisService.getKey(RedisKey.TEST_RANDOM_NUMBER);
        expect(storedNumber).toMatchObject({ rng });
      });
    });

    describe('getKey', () => {
      it('should read persisted random number', async () => {
        const storedNumber = await redisService.getKey(RedisKey.TEST_RANDOM_NUMBER);
        expect(storedNumber).toMatchObject({ rng });
      });
    });

    describe('delKey', () => {
      it('should delete persisted random number', async () => {
        await redisService.delKey(RedisKey.TEST_RANDOM_NUMBER);
        const testKey = await redisService.getKey(RedisKey.TEST_RANDOM_NUMBER);
        expect(testKey).toBeNull();
      });
    });
  },

});
