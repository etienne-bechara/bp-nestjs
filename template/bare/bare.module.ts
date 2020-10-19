import { Module } from '@nestjs/common';

import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseController } from './dot.case.controller';
import { PascalCaseService } from './dot.case.service';

@Module({
  controllers: [ PascalCaseController ],
  providers: [ PascalCaseConfig, PascalCaseService ],
  exports: [ PascalCaseService ],
})
export class PascalCaseModule { }
