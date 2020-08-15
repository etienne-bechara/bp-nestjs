import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import qs from 'qs';

import { AppProvider } from '../app/app.provider';
import { HttpsReturnType } from './https.enum';
import { HttpsRequestParams, HttpsServiceOptions } from './https.interface';
import { HttpsSettings } from './https.settings';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpsService extends AppProvider {
  private settings: HttpsSettings = this.getSettings();
  private defaultReturnType: HttpsReturnType;
  private defaultTimeout: number;
  private defaultValidator: (status: number)=> boolean;
  private baseUrl: string;
  private baseHeaders: Record<string, string>;
  private baseQuery: Record<string, string>;
  private baseData: Record<string, unknown>;
  private httpsAgent: https.Agent;
  private instance: AxiosInstance;

  /**
   * Creates new HTTP instance based on Axios, validator is
   * set to always true since we are customizing the response
   * handler to standardize exception reporting
   * @param params
   */
  public setupInstance(params: HttpsServiceOptions): void {
    this.setDefaultParams(params);
    this.setBaseParams(params);
    this.setHttpsAgent(params);
    this.instance = axios.create({
      timeout: this.defaultTimeout,
      validateStatus: () => true,
      httpsAgent: this.httpsAgent,
    });
  }

  /**
   * Defines and stores instance defaults, if not available set them to:
   * • Return type to DATA (Axios response data)
   * • Timeout to global default configured at https.setting
   * • Validator to pass on status lower than 400 (< bad request)
   * @param params
   */
  private setDefaultParams(params: HttpsServiceOptions): void {
    this.defaultReturnType = params.defaultReturnType || HttpsReturnType.DATA;
    this.defaultTimeout = params.defaultTimeout || this.settings.HTTPS_DEFAULT_TIMEOUT;
    this.defaultValidator = params.defaultValidator
      ? params.defaultValidator
      : (s): boolean => s < 400;
  }

  /**
   * Store base URL, body and headers if configured at setup
   * @param params
   */
  private setBaseParams(params: HttpsServiceOptions): void {
    this.baseUrl = params.baseUrl,
    this.baseHeaders = params.baseHeaders || { };
    this.baseQuery = params.baseQuery;
    this.baseData = params.baseData;
  }

  /**
   * Configures the https agent according to priority:
   * • If httpsAgent property is set, use it
   * • If ssl property is set, decode certificate and use it
   * • If ignoreHttpsErrors, customize it with a simple rejectUnauthorized
   * @param params
   */
  private setHttpsAgent(params: HttpsServiceOptions): void {
    if (params.httpsAgent) {
      this.httpsAgent = params.httpsAgent;
    }
    else if (params.ssl) {
      this.httpsAgent = new https.Agent({
        cert: Buffer.from(params.ssl.cert, 'base64').toString('ascii'),
        key: Buffer.from(params.ssl.key, 'base64').toString('ascii'),
        passphrase: params.ssl.passphrase,
        rejectUnauthorized: !params.ignoreHttpsErrors,
      });
    }
    else if (params.ignoreHttpsErrors) {
      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }
  }

  /**
   * Given configured params for an http request, join previously configured
   * base URL, headers, query and data, returning a clone.
   * In case of conflicts the defaults are overwritten
   * @param param
   */
  private mergeBaseParams(params: HttpsRequestParams): HttpsRequestParams {
    const mergedParams = Object.assign({ }, params);

    if (this.baseUrl) {
      mergedParams.url = `${this.baseUrl}${params.url}`;
    }

    if (this.baseHeaders || params.headers) {
      if (!params.headers) params.headers = { };
      mergedParams.headers = { ...this.baseHeaders, ...params.headers };
    }

    if (this.baseQuery) {
      mergedParams.params = { ...this.baseQuery, ...params.params };
    }

    if (this.baseData) {
      if (params.data) mergedParams.data = { ...this.baseData, ...params.data };
      if (params.form) mergedParams.form = { ...this.baseData, ...params.form };
    }

    return mergedParams;
  }

  /**
   * Apply the following request params replacements:
   * • URLs with :param_name to its equivalent at replacements property
   * • Request data as stringified form if property is present
   * @param params
   */
  private replaceVariantParams(params: HttpsRequestParams): HttpsRequestParams {
    const replacedParams = Object.assign({ }, params);

    if (params.replacements) {
      for (const key in params.replacements) {
        const replaceRegex = new RegExp(`:${key}`, 'g');
        const value = encodeURIComponent(params.replacements[key].toString());
        replacedParams.url = replacedParams.url.replace(replaceRegex, value);
      }
    }

    if (params.form) {
      replacedParams.headers['content-type'] = 'application/x-www-form-urlencoded';
      replacedParams.data = qs.stringify(params.form);
    }

    return replacedParams;
  }

  /**
   * Handles all requests, extending default axios functionality with:
   * • Better validation: Include returned data in case of validation failure
   * • Better timeout: Based on server timing instead of only after DNS resolve
   * • Error standardization: Add several data for easier debugging
   * @param params
   */
  public async request<T>(params: HttpsRequestParams): Promise<T> {
    if (!this.instance) {
      throw new InternalServerErrorException('https service must be configured');
    }

    const finalParams = this.replaceVariantParams(this.mergeBaseParams(params));
    const returnType = finalParams.returnType || this.defaultReturnType;
    const validator = finalParams.validateStatus || this.defaultValidator;
    const timeout = finalParams.timeout || this.defaultTimeout;
    const cancelSource = axios.CancelToken.source();

    let errorMsg: string;
    let res: AxiosResponse | void;
    finalParams.cancelToken = cancelSource.token;

    try {
      res = await Promise.race([
        this.instance(finalParams),
        this.halt(timeout),
      ]);

      if (!res) {
        cancelSource.cancel();
        errorMsg = `timed out after ${timeout / 1000}s`;
      }
      else if (!validator(res.status)) {
        errorMsg = `failed with status code ${res.status}`;
      }
    }
    catch (e) {
      errorMsg = e.message.includes('timeout')
        ? `timed out after ${timeout / 1000}s`
        : `failed due to ${e.message}`;
    }

    if (errorMsg) {
      throw new InternalServerErrorException({
        message: `${params.method} ${params.url} ${errorMsg}`,
        config: params,
        status: res ? res.status : undefined,
        headers: res ? res.headers : undefined,
        data: res ? res.data : undefined,
      });
    }

    return res && returnType === HttpsReturnType.DATA
      ? res.data
      : res;
  }

  /** GET */
  public async get<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'GET';
    params.url = url;
    return this.request<T>(params);
  }

  /** POST */
  public async post<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'POST';
    params.url = url;
    return this.request<T>(params);
  }

  /** PUT */
  public async put<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'PUT';
    params.url = url;
    return this.request<T>(params);
  }

  /** DELETE */
  public async delete<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'DELETE';
    params.url = url;
    return this.request<T>(params);
  }

}
