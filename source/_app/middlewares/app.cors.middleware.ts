import { Injectable, NestMiddleware } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

import { AbstractProvider } from '../../_abstract/abstract.provider';

@Injectable()
export class AppCorsMiddleware extends AbstractProvider implements NestMiddleware {

  /**
   * If anabled at environment, add header properties to allow CORS
   * @param req
   * @param res
   * @param next
   */
  public use(req: IncomingMessage, res: ServerResponse, next: ()=> void): void {

    if (this.settings.APP_ENABLE_CORS) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    }

    next();
  }

}
