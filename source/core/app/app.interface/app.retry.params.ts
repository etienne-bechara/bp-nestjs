export interface AppRetryParams {
  instance: any;
  method: string;
  args?: any;
  retries?: number;
  timeout?: number;
  delay?: number;
  retryIf?: (e: any)=> boolean;
}
