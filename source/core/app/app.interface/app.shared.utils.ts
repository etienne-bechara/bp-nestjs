import { AppRetryParams } from '.';

export interface AppSharedUtils {
  halt: (ms: number) => Promise<void>;
  retryOnException: (params: AppRetryParams) => Promise<any>;
}
