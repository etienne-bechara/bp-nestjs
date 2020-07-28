import { Module } from '@nestjs/common';

import { _Pascal_Service } from './_Dot_.service';

@Module({
  providers: [ _Pascal_Service ],
  exports: [ _Pascal_Service ],
})
export class _Pascal_Module { }
