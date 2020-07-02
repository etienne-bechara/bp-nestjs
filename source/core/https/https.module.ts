import { Module } from '@nestjs/common';

import { HttpsService } from './https.service';

@Module({
  providers: [ HttpsService ],
  exports: [ HttpsService ],
})
export class HttpsModule { }
