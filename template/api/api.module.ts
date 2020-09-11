import { Module } from '@nestjs/common';

import { PascalCaseController } from './dot.case.controller';
import { PascalCaseService } from './dot.case.service';

@Module({
  controllers: [ PascalCaseController ],
  providers: [ PascalCaseService ],
  exports: [ PascalCaseService ],
})
export class PascalCaseModule { }
