import { Controller, Get } from '@nestjs/common';

import { StatusData } from './interfaces/status.data';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {

  /** */
  public constructor(private statusService: StatusService) { }

  /**
   * Implements a very simple status reading functionality to
   * validate framework and middlewares
   */
  @Get()
  public getStatus(): Promise<StatusData> {
    return this.statusService.readStatus();
  }

}
