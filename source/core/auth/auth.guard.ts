import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { AppRequest } from '../../core/app/app.interface';
import { AuthConfig } from './auth.config';
import { AuthStrategy } from './auth.enum';

@Injectable()
export class AuthGuard implements CanActivate {

  public constructor(
    private readonly authConfig: AuthConfig,
  ) { }

  /**
   * Implements a global authentication according to
   * configured environment variables
   * Refer to .env.schema for detailed information.
   * @param context
   */
  public canActivate(context: ExecutionContext): boolean {
    if (!this.authConfig.AUTH_STRATEGY) return true;
    const req: AppRequest = context.switchToHttp().getRequest();

    const authString = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : undefined;

    const authKey = this.authConfig.AUTH_STRATEGY === AuthStrategy.JWT_RSA
      ? Buffer.from(this.authConfig.AUTH_KEY, 'base64')
      : this.authConfig.AUTH_KEY;

    if (!authString) {
      throw new UnauthorizedException('missing authorization header');
    }

    // Static Token
    if (this.authConfig.AUTH_STRATEGY === AuthStrategy.STATIC_TOKEN) {
      if (authString !== this.authConfig.AUTH_KEY) {
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
