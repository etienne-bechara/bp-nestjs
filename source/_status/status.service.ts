import { Injectable } from '@nestjs/common';

import { CommonProvider } from '../_common/common.provider';
import { StatusData } from './interfaces/status.data';

@Injectable()
export class StatusService extends CommonProvider {

  /**
   * Implements a very simple status reading functionality to
   * validate framework and middlewares
   */
  public async readStatus(): Promise<StatusData> {
    return {
      uptime: process.uptime(),
    };
  }

}
