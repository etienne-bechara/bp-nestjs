import { Module } from '@nestjs/common';

import { RapidApiService } from './rapid-api.service';

@Module({
  providers: [ RapidApiService ],
  exports: [ RapidApiService ],
})
export class RapidApiModule { }
