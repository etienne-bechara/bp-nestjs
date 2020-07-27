import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { AppRequest } from '../../core/app/app.interface';
import { AppProvider } from './app.service';
import { AppSettings } from './app.settings';

@Injectable()
export class AppGuard extends AppProvider implements CanActivate {
  private settings: AppSettings = this.getSettings();

  /**
   * Implements a very basic authentication guard that checks if
   * Authorization property at header matches configured token
   * @param context
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;

    if (this.settings.APP_AUTHORIZATION) {
      if (!authorization) {
        throw new UnauthorizedException('missing authorization header');
      }

      if (authorization !== this.settings.APP_AUTHORIZATION) {
        throw new UnauthorizedException('invalid authorization header');
      }
    }

    return true;
  }
}
