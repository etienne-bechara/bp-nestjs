import { Module } from '@nestjs/common';

import { HttpsModule } from '../core/https/https.module';
import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseController } from './dot.case.controller';
import { PascalCaseService } from './dot.case.service';

@Module({
  imports: [
    HttpsModule.registerAsync({
      inject: [ PascalCaseConfig ],
      useFactory: (camelCaseConfig: PascalCaseConfig) => ({
        bases: {
          url: camelCaseConfig.UPPER_CASE_HOST,
          headers: {
            authorization: camelCaseConfig.UPPER_CASE_API_KEY,
          },
        },
      }),
    }),
  ],
  controllers: [ PascalCaseController ],
  providers: [ PascalCaseConfig, PascalCaseService ],
  exports: [ PascalCaseConfig, PascalCaseService ],
})
export class PascalCaseModule { }
