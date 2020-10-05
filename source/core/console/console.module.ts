import { Module } from '@nestjs/common';

import { ConsoleService } from './console.service';

@Module({
  providers: [ ConsoleService ],
})
export class ConsoleModule { }
