import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { AppRequest } from '../../core/app/app.interface';
import { AppAuthStrategy } from './app.enum';
import { AppProvider } from './app.provider';
import { AppSettings } from './app.settings';

@Injectable()
export class AppGuard extends AppProvider implements CanActivate {
  private settings: AppSettings = this.getSettings();

  /**
   * Implements very basic global authentication according to
   * configured environment variables
   * Refer to .sample.env for detailed information
   * @param context
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const authString = req.headers.authorization;

    // None
    if (this.settings.AUTH_GLOBAL_STRATEGY === AppAuthStrategy.NONE) {
      return true;
    }
    else if (!authString) {
      throw new UnauthorizedException('missing authorization header');
    }

    // JWT HS256
    if (this.settings.AUTH_GLOBAL_STRATEGY === AppAuthStrategy.JWT_HS256) {
      try {
        req.metadata.jwtPayload = jwt.verify(
          authString.replace('Bearer ', ''),
          this.settings.AUTH_JWT_HS256_CLIENT_SECRET,
        );
      }
      catch (e) {
        throw new UnauthorizedException('invalid authorization header');
      }
    }

    // Static Token
    else if (this.settings.AUTH_GLOBAL_STRATEGY === AppAuthStrategy.STATIC_TOKEN) {
      if (authString !== this.settings.AUTH_STATIC_TOKEN) {
        throw new UnauthorizedException('invalid authorization header');
      }
    }

    return true;
  }
}
