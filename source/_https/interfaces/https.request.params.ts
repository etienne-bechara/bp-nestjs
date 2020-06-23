import { AxiosRequestConfig } from 'axios';

/**
 * Sets up a custom HTTP instance based on Axios
 */
export interface HttpsSetupParams {

  defaultValidator?: (status: number)=> boolean;
  defaultReturnType?: 'data' | 'full';
  defaultTimeout?: number;

  baseUrl: string;
  baseData?: Record<string, unknown>;
  baseHeaders?: Record<string, string>;

  ignoreHttpsErrors?: boolean;
  randomizeUserAgent?: boolean;

}

/**
 * Adds extra request options to Axios package
 */
export interface HttpsRequestParams extends AxiosRequestConfig {

  form?: Record<string, unknown>;
  replacements?: Record<string, unknown>;

  returnType?: 'data' | 'full';

}
