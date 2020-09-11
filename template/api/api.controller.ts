import { Controller } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { PascalCaseService } from './dot.case.service';
import { PascalCaseSettings } from './dot.case.settings';

@Controller('path/case')
export class PascalCaseController extends AppProvider {
  private settings: PascalCaseSettings = this.getSettings();

  public constructor(private readonly camelCaseService: PascalCaseService) { super(); }

  /* If you with to expose any functionalities implement them here */

  // @Get('user')
  // public async getUsers(): Promise<PascalCaseUser[]> {
  //   return this.camelCaseService.readUsers();
  // }

}
