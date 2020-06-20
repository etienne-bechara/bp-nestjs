import { AxiosRequestConfig } from 'axios';

export interface HttpsRequestParams extends AxiosRequestConfig {
  validateCustom?: (status: number)=> boolean;
  returnType?: 'data' | 'full';
  form?: Record<string, unknown>;
  baseData?: Record<string, unknown>;
  replacements?: Record<string, unknown>;
}
