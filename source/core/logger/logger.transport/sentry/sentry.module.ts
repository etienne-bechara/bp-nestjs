import { Module } from '@nestjs/common';

import { SentryService } from './sentry.service';

@Module({
  providers: [ SentryService ],
})
export class SentryModule { }
