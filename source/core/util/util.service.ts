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
    const p = params;

    let msg = `${p.method}(): running with ${p.retries || '∞'} `;
    msg += `retries and ${p.timeout / 1000 || '∞ '}s timeout...`;
    this.loggerService.debug(msg);

    const startTime = new Date().getTime();
    let tentative = 1;
    let result: T;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        result = await p.instance[p.method](...p.args);
        break;
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (p.retries && tentative > p.retries) throw e;
        else if (p.timeout && elapsed > p.timeout) throw e;
        else if (p.breakIf?.(e)) throw e;
        tentative++;

        msg = `${p.method}(): ${e.message} | Retry #${tentative}/${p.retries || '∞'}`;
        msg += `, elapsed ${elapsed / 1000}/${p.timeout / 1000 || '∞ '}s...`;
        this.loggerService.debug(msg);

        await this.halt(p.delay || 0);
      }
    }

    this.loggerService.debug(`${p.method}() finished successfully!`);
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
    const { data: v4 } = await axios.get('https://api.ipify.org');
    const { data: v6 } = await axios.get('https://api6.ipify.org');
    return {
      public_ipv4: v4,
      public_ipv6: v6,
      interfaces: os.networkInterfaces(),
    };
  }

}
