import { HttpsReturnType } from '../https.enum';

/**
 * Sets up a custom HTTP instance based on Axios
 */
export interface HttpsSetupParams {

  defaultValidator?: (status: number)=> boolean;
  defaultReturnType?: HttpsReturnType;
  defaultTimeout?: number;

  baseUrl: string;
  baseData?: Record<string, unknown>;
  baseHeaders?: Record<string, string>;

  ignoreHttpsErrors?: boolean;
  randomizeUserAgent?: boolean;

}
