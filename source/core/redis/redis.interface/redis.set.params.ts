export interface RedisSetParams {
  key: string;
  value: any;
  skip?: 'IF_EXIST' | 'IF_NOT_EXIST';
  keepTtl?: boolean;
  duration?: number;
}
