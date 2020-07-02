import { Injectable, NestMiddleware } from '@nestjs/common';
import requestIp from 'request-ip';

import { AbstractProvider } from '../../abstract/abstract.provider';
import { AppEnvironment } from '../app.enum';
import { AppRequest, AppResponse } from '../app.interface';

@Injectable()
export class AppLoggerMiddleware extends AbstractProvider implements NestMiddleware {

  /**
   * Isolates user agent and IP address, then prints request data
   * on console if on development environment
   * @param req
   * @param res
   * @param next
   */
  public use(req: AppRequest, res: AppResponse, next: ()=> void): void {

    req.metadata = {
      ip: requestIp.getClientIp(req) || null,
      userAgent: req.headers ? req.headers['user-agent'] : null,
    };

    if (this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
      this.logger.server(`${req.method.padEnd(6, ' ')} ${req.url} | ${req.metadata.ip} | ${req.metadata.userAgent}`);
    }

    next();
  }

}
