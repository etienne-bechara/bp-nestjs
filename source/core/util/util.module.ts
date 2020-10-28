import { Module } from '@nestjs/common';

import { HttpsModule } from '../https';
import { UtilController } from './util.controller';
import { UtilService } from './util.service';

@Module({
  imports: [ HttpsModule.register() ],
  controllers: [ UtilController ],
  providers: [ UtilService ],
  exports: [ UtilService ],
})
export class UtilModule { }
