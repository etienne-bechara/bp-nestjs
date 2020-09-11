import { Controller } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { PascalCaseService } from './dot.case.service';

@Controller('path/case')
export class PascalCaseController extends AppProvider {

  public constructor(private readonly camelCaseService: PascalCaseService) { super(); }

}
