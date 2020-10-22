import { Injectable } from '@nestjs/common';
import axios from 'axios';
import os from 'os';

import { AppRetryParams } from '../app/app.interface';
import { LoggerService } from '../logger/logger.service';
import { UtilAppNetwork, UtilAppStatus } from './util.interface';

@Injectable()
export class UtilService {

  public constructor(
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Asynchronously wait for desired amount of milliseconds.
   * @param ms
   */
  public async halt(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  public async retryOnException<T>(params: AppRetryParams): Promise<T> {
    const methodName = params.name || 'Unnamed';

    let startMsg = `${methodName}: running with ${params.retries || '∞'} `;
    startMsg += `retries and ${params.timeout / 1000 || '∞ '}s timeout...`;
    this.loggerService.debug(startMsg);

    const startTime = new Date().getTime();
    let tentative = 1;
    let result: T;

    while (true) { // eslint-disable-line no-constant-condition
      try {
        result = await params.method();
        break;
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (params.retries && tentative > params.retries) throw e;
        else if (params.timeout && elapsed > params.timeout) throw e;
        else if (params.breakIf?.(e)) throw e;
        tentative++;

        let retryMsg = `${methodName}: ${e.message} | Retry #${tentative}/${params.retries || '∞'}`;
        retryMsg += `, elapsed ${elapsed / 1000}/${params.timeout / 1000 || '∞ '}s...`;
        this.loggerService.debug(retryMsg);

        await this.halt(params.delay || 0);
      }
    }

    this.loggerService.debug(`${methodName}: finished successfully!`);
    return result;
  }

  /**
   * Reads data regarding current runtime and network.
   * Let network acquisition fail if unable to fetch ips.
   */
  public async getAppStatus(): Promise<UtilAppStatus> {
    let network: UtilAppNetwork;

    try {
      network = await this.getAppNetwork();
    }
    catch (e) {
      this.loggerService.error(e);
    }

    return {
      system: {
        version: os.version(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch(),
        endianness: os.endianness(),
        uptime: os.uptime(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus(),
      network,
    };
  }

  /**
   * Reads data regarding application network.
   */
  public async getAppNetwork(): Promise<UtilAppNetwork> {
    const { data } = await axios.get('https://api64.ipify.org');
    return {
      public_ip: data,
      interfaces: os.networkInterfaces(),
    };
  }

}
