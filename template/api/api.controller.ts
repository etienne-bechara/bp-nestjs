import { Controller } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { _Pascal_Service } from './_Dot_.service';
import { _Pascal_Settings } from './_Dot_.settings';

@Controller('_Path_')
export class _Pascal_Controller extends AppProvider {
  private settings: _Pascal_Settings = this.getSettings();

  /** */
  public constructor(private readonly _Camel_Service: _Pascal_Service) { super(); }

  /* If you with to expose any functionalities implement them here */

  // @Get('user')
  // public async getUsers(): Promise<_Pascal_User[]> {
  //   return this._Camel_Service.readUsers();
  // }

}
