import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { AppProvider } from '../app.provider';
import { AppSettings } from '../app.settings';

@Injectable()
export class AppTimeoutInterceptor extends AppProvider implements NestInterceptor {
  private settings: AppSettings = this.getSettings();

  /**
   * Creates a true server side timer that ends any requests
   * if exceding configured timeout
   *
   * If using serverless, remember to configure service timeout
   * over the one configure here at the application
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const msTimeout = this.settings.APP_TIMEOUT;

    if (!msTimeout) return next.handle();
    return next
      .handle()
      .pipe(
        timeout(msTimeout),
        catchError(err => {
          if (err instanceof TimeoutError) {
            return throwError(
              new GatewayTimeoutException('failed to fulfill request within timeout'),
            );
          }
          return throwError(err);
        }),
      );
  }

}
