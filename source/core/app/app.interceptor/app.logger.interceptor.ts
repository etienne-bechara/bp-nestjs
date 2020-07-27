import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import requestIp from 'request-ip';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AppEnvironment } from '../app.enum';
import { AppRequest, AppResponse } from '../app.interface';
import { AppProvider } from '../app.provider';
import { AppSettings } from '../app.settings';

@Injectable()
export class AppLoggerInterceptor extends AppProvider implements NestInterceptor {
  private settings: AppSettings = this.getSettings();

  /**
   * Isolates user agent and IP address, then prints request and
   * response data if at development environment
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const start = new Date().getTime();

    req.metadata = {
      ip: requestIp.getClientIp(req) || null,
      userAgent: req.headers ? req.headers['user-agent'] : null,
    };

    const reqTarget = `${req.method.padEnd(6, ' ')} ${req.url}`;
    if (this.settings.NODE_ENV === AppEnvironment.DEVELOPMENT) {
      this.logger.server(`> ${reqTarget} | ${req.metadata.ip} | ${req.metadata.userAgent}`);
    }

    return next
      .handle()
      .pipe(
        finalize(() => {
          const res: AppResponse = context.switchToHttp().getResponse();
          this.logger.server(`< ${reqTarget} | ${res.statusCode} | ${new Date().getTime() - start} ms`);
        }),
      );
  }

}
