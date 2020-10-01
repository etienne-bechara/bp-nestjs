import { Controller } from '@nestjs/common';

import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseService } from './dot.case.service';

@Controller('path/case')
export class PascalCaseController {
  private config: PascalCaseConfig = this.getConfig();

  public constructor(private readonly camelCaseService: PascalCaseService) { }

  /* If you with to expose any functionalities implement them here */

  // @Get('user')
  // public async getUsers(): Promise<PascalCaseUser[]> {
  //   return this.camelCaseService.readUsers();
  // }

}
