import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { AppRequest } from '../../core/app/app.interface';
import { AppProvider } from '../app/app.provider';
import { AuthStrategy } from './auth.enum';
import { AuthSettings } from './auth.settings';

@Injectable()
export class AuthGuard extends AppProvider implements CanActivate {
  private settings: AuthSettings = this.getSettings();

  /**
   * Implements a global authentication according to
   * configured environment variables
   * Refer to .env.sample for detailed information.
   * @param context
   */
  public canActivate(context: ExecutionContext): boolean {
    const req: AppRequest = context.switchToHttp().getRequest();

    const authString = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : undefined;

    const authKey = this.settings.AUTH_STRATEGY === AuthStrategy.JWT_RSA
      ? Buffer.from(this.settings.AUTH_KEY, 'base64')
      : this.settings.AUTH_KEY;

    if (!authString) {
      throw new UnauthorizedException('missing authorization header');
    }

    // None
    if (!this.settings.AUTH_STRATEGY) return true;

    // Static Token
    if (this.settings.AUTH_STRATEGY === AuthStrategy.STATIC_TOKEN) {
      if (authString !== this.settings.AUTH_KEY) {
        throw new UnauthorizedException('invalid authorization header');
      }
      return true;
    }

    // JWT
    try {
      req.metadata.jwtPayload = jwt.verify(authString, authKey);
    }
    catch {
      throw new UnauthorizedException('invalid authorization header');
    }

    return true;
  }
}
