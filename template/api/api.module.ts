import { Module } from '@nestjs/common';

import { ConfigService } from '../core/config/config.service';
import { HttpsModule } from '../core/https/https.module';
import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseController } from './dot.case.controller';
import { PascalCaseService } from './dot.case.service';

@Module({
  imports: [
    HttpsModule.registerAsync({
      inject: [ ConfigService ],
      useFactory: (configService: ConfigService<PascalCaseConfig>) => {
        return {
          bases: {
            url: configService.get('UPPER_CASE_HOST'),
            headers: {
              authorization: configService.get('UPPER_CASE_API_KEY'),
            },
          },
        };
      },
    }),
  ],
  controllers: [ PascalCaseController ],
  providers: [ PascalCaseService ],
  exports: [ PascalCaseService ],
})
export class PascalCaseModule { }
