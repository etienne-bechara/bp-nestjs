import { Controller } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { _Pascal_Service } from './_Dot_.service';

@Controller('_Path_')
export class _Pascal_Controller extends AppProvider {

  public constructor(private readonly _Camel_Service: _Pascal_Service) { super(); }

}
