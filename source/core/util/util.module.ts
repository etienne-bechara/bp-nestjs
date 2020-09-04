import { Module } from '@nestjs/common';

import { UtilController } from './util.controller';
import { UtilService } from './util.service';

@Module({
  controllers: [ UtilController ],
  providers: [ UtilService ],
  exports: [ UtilService ],
})
export class UtilModule { }
