import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

import { AbstractProvider } from '../../_abstract/abstract.provider';

@Injectable()
export class AppAuthMiddleware extends AbstractProvider implements NestMiddleware {

  /**
   * Implements a very basic authentication middleware that checks if
   * Authorization property at header matches configured token at env
   * @param req
   * @param res
   * @param next
   */
  public use(req: IncomingMessage, res: ServerResponse, next: ()=> void): void {

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
