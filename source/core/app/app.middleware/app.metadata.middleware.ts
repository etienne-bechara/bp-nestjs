import { Injectable, NestMiddleware } from '@nestjs/common';
import requestIp from 'request-ip';

import { AppRequest, AppResponse } from '../app.interface';

@Injectable()
export class AppMetadataMiddleware implements NestMiddleware {

  /**
   * This middleware is globally bound so it shall be executed first
   * Its purpose is to extract desired request metadata
   * @param req
   * @param res
   * @param next
   */
  public use(req: AppRequest, res: AppResponse, next: any): void {

    req.metadata = {
      ip: requestIp.getClientIp(req) || null,
      userAgent: req.headers ? req.headers['user-agent'] : null,
    };

    next();
  }

}
