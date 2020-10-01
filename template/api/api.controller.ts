import { Controller } from '@nestjs/common';

import { PascalCaseService } from './dot.case.service';

@Controller('path/case')
export class PascalCaseController {

  public constructor(private readonly camelCaseService: PascalCaseService) { }

  /* If you with to expose any functionalities implement them here */

  // @Get('user')
  // public async getUsers(): Promise<PascalCaseUser[]> {
  //   return this.camelCaseService.readUsers();
  // }

}
