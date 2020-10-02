import { Injectable, NestMiddleware } from '@nestjs/common';
import requestIp from 'request-ip';

import { AppRequest, AppResponse } from './app.interface';

@Injectable()
export class AppMiddleware implements NestMiddleware {

  /**
   * Applies a global middleware that act upon every
   * request before anything else.
   * @param req
   * @param res
   * @param next
   */
  public use(req: AppRequest, res: AppResponse, next: any): void {
    this.addRequestMetadata(req);
    next();
  }

  /**
   * Adds a metadata object on all request for easy access
   * to user ip, agent and jwt payload.
   * @param req
   */
  public addRequestMetadata(req: AppRequest): void {
    req.metadata = {
      ip: requestIp.getClientIp(req) || null,
      userAgent: req.headers ? req.headers['user-agent'] : null,
      jwtPayload: { },
    };
  }

}
