import { AxiosResponse } from 'axios';
import https from 'https';

import { HttpsReturnType } from '../https.enum';
import { HttpsRequestParams } from './https.request.params';

/**
 * Sets up a custom HTTP instance based on Axios.
 */
export interface HttpsServiceOptions {

  httpsAgent?: https.Agent;
  ignoreHttpsErrors?: boolean;

  baseUrl?: string;
  baseQuery?: Record<string, string>;
  baseData?: Record<string, unknown>;
  baseHeaders?: Record<string, string>;

  defaultReturnType?: HttpsReturnType;
  defaultTimeout?: number;
  defaultValidator?: (status: number)=> boolean;
  defaultExceptionHandler?: (
    requestParams: HttpsRequestParams,
    upstreamResponse: AxiosResponse | any,
    errorMessage: string
  )=> Promise<void>;

  ssl?: {
    cert: string;
    key: string;
    passphrase?: string;
  }

}
