import { Controller, Get } from '@nestjs/common';

import { AppProvider } from '../app/app.provider';
import { UtilAppStatus } from './util.interface';
import { UtilService } from './util.service';

@Controller('util')
export class UtilController extends AppProvider {

  public constructor(private readonly utilService: UtilService) { super(); }

  /**
   * Returns basic stats about runtime.
   */
  @Get('status')
  public async getUtilStatus(): Promise<UtilAppStatus> {
    return this.utilService.readAppStatus();
  }

}
