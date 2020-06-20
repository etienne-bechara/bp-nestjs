/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import qs from 'qs';

import { CommonProvider } from '../_common/common.provider';
import { HttpsRequestParams } from './interfaces/https.request.params';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpsService extends CommonProvider {

  private defaultValidator: (status: number)=> boolean = (s) => s < 400;
  private defaultReturnType: 'data' | 'full' = 'data';

  private baseData: Record<string, unknown>;
  private instance: AxiosInstance;

  /**
   * Creates new HTTP instance based on Axios params
   * Change the following default behaviours:
   * - Sets default timeout according to settings
   * - Sets default return type to data
   * - Save custom status validation at instance level
   * - Remove validation inside axios handler
   * @param params
   */
  public setupInstance(params: HttpsRequestParams = { }): void {
    if (!params.timeout) params.timeout = this.settings.HTTPS_DEFAULT_TIMEOUT;
    if (!params.headers) params.headers = { };
    if (!params.headers['user-agent']) params.headers['user-agent'] = this.settings.HTTPS_DEFAULT_USER_AGENT;

    if (params.returnType) this.defaultReturnType = params.returnType;
    if (params.validateStatus) this.defaultValidator = params.validateStatus;
    if (params.baseData) this.baseData = params.baseData;

    params.validateStatus = (): boolean => true;
    this.instance = axios.create(params);
  }

  /**
   * Handles all requests, if a custom status validation function
   * is passed use it, otherwise apply the default validator
   * In case of any errors, standardize the output for easy debugging
   * @param params
   */
  public async request(params: HttpsRequestParams): Promise<any> {
    const rawParms = JSON.parse(JSON.stringify(params));
    this.transformParams(params);
    let errorPrefix;
    let res;

    try {
      res = await this.instance(params);
      const validator = params.validateCustom || this.defaultValidator;
      if (!validator(res.status)) errorPrefix = 'Request failed';
    }
    catch (e) {
      if (e.message.includes('timeout')) errorPrefix = 'Request timed out';
      else errorPrefix = 'Request unknown exception';
    }

    if (errorPrefix) {
      throw new InternalServerErrorException({
        message: `${errorPrefix}: ${rawParms.method} ${rawParms.url}`,
        config: rawParms,
        status: res ? res.status : undefined,
        headers: res ? res.headers : undefined,
        data: res ? res.data : undefined,
      });
    }

    const returnType = params.returnType || this.defaultReturnType;
    return returnType === 'data' ? res.data : res;
  }

  /**
   * Apply custom rules to inbound params for better usability
   * @param param
   */
  private transformParams(params: HttpsRequestParams): void {
    if (!params.headers) params.headers = { };

    // Join data with base data
    if (this.baseData) {
      if (params.data) params.data = { ...this.baseData, ...params.data };
      if (params.form) params.form = { ...this.baseData, ...params.form };
      if (params.params) params.params = { ...this.baseData, ...params.params };
    }

    // Automatically stringify forms and set its header
    if (params.form) {
      params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      params.data = qs.stringify(params.form);
    }

    // Apply URL replacements
    if (params.replacements) {
      for (const key in params.replacements) {
        const replaceRegex = new RegExp(`:${key}`, 'g');
        const value = encodeURIComponent(params.replacements[key].toString());
        params.url = params.url.replace(replaceRegex, value);
      }
    }

  }

  /** GET */
  public async get(url: string, params: HttpsRequestParams = { }): Promise<any> {
    params.method = 'GET';
    params.url = url;
    return this.request(params);
  }

  /** POST */
  public async post(url: string, params: HttpsRequestParams = { }): Promise<any> {
    params.method = 'POST';
    params.url = url;
    return this.request(params);
  }

  /** PUT */
  public async put(url: string, params: HttpsRequestParams = { }): Promise<any> {
    params.method = 'PUT';
    params.url = url;
    return this.request(params);
  }

  /** DELETE */
  public async delete(url: string, params: HttpsRequestParams = { }): Promise<any> {
    params.method = 'DELETE';
    params.url = url;
    return this.request(params);
  }

}
