import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

import { CommonProvider } from '../_common/common.provider';

@Injectable()
export class AuthMiddleware extends CommonProvider implements NestMiddleware {

  /**
   * Checks if Authorization header matchers auth token
   * @param req
   * @param res
   * @param next
   */
  public use(req: IncomingMessage, res: ServerResponse, next: ()=> void): void {
    const authorization = req.headers.authorization;
    if (!authorization) throw new UnauthorizedException('missing authorization header');

    if (authorization !== this.settings.APP_AUTHORIZATION) {
      throw new UnauthorizedException('invalid authorization header');
    }

    next();
  }
}
