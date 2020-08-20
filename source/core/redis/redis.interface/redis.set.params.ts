import { RedisKey } from '../redis.enum';

export interface RedisSetParams {
  key: RedisKey;
  value: any;
  skip?: 'IF_EXIST' | 'IF_NOT_EXIST';
  keepTtl?: boolean;
  duration?: number;
}
