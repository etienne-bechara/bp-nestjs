import { Module } from '@nestjs/common';

import { RedisConfig } from './redis.config';
import { RedisService } from './redis.service';

@Module({
  providers: [ RedisConfig, RedisService ],
  exports: [ RedisService ],
})
export class RedisModule { }
