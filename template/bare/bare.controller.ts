import { Controller } from '@nestjs/common';

import { PascalCaseService } from './dot.case.service';

@Controller('path/case')
export class PascalCaseController {

  public constructor(private readonly camelCaseService: PascalCaseService) { }

}
