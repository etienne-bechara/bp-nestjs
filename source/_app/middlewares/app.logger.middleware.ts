import { Injectable, NestMiddleware } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import requestIp from 'request-ip';

import { CommonProvider } from '../../_common/common.provider';
import { AppEnvironment } from '../app.enum';

@Injectable()
export class AppLoggerMiddleware extends CommonProvider implements NestMiddleware {

  /**
   * Isolates user agent and IP address, then prints request data
   * on console if on development environment
   * @param req
   * @param res
   * @param next
   */
  public use(req: IncomingMessage, res: ServerResponse, next: ()=> void): void {

    req['ip'] = requestIp.getClientIp(req);
    req['userAgent'] = req.headers ? req.headers['user-agent'] : null;

    if (this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
      this.logger.server(`> ${req.method.padStart(6, ' ')} ${req.url} | ${req['ip']} | ${req['userAgent']}`);
    }

    next();
  }

}
