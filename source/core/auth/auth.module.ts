import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthConfig } from './auth.config';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    AuthConfig,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule { }
