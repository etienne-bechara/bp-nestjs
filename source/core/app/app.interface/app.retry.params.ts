export interface AppRetryParams {
  instance: any;
  method: string;
  args?: any;
  retries?: number;
  timeout?: number;
  delay?: number;
  validateRetry?: (e: any)=> boolean;
}
