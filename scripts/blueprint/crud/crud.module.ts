import { Module } from '@nestjs/common';

import { __PascalCaseName__Controller } from './__DotCaseName__.controller';
import { __PascalCaseName__Service } from './__DotCaseName__.service';

@Module({
  controllers: [ __PascalCaseName__Controller ],
  providers: [ __PascalCaseName__Service ],
  exports: [ __PascalCaseName__Service ],
})
export class __PascalCaseName__Module { }
