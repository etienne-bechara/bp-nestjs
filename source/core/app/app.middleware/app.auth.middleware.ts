import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

import { AppRequest, AppResponse } from '../app.interface';
import { AppProvider } from '../app.provider';
import { AppSettings } from '../app.settings';

@Injectable()
export class AppAuthMiddleware extends AppProvider implements NestMiddleware {
  private settings: AppSettings = this.getSettings();

  /**
   * Implements a very basic authentication middleware that checks if
   * Authorization property at header matches configured token at env
   * @param req
   * @param res
   * @param next
   */
  public use(req: AppRequest, res: AppResponse, next: ()=> void): void {

    const authorization = req.headers.authorization;
    if (!authorization && this.settings.APP_AUTHORIZATION) {
      throw new UnauthorizedException('missing authorization header');
    }

    if (authorization !== this.settings.APP_AUTHORIZATION) {
      throw new UnauthorizedException('invalid authorization header');
    }

    next();
  }

}
