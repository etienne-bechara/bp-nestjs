/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AbstractProvider } from '../../abstract/abstract.provider';

@Injectable()
export class AbstractEntityInterceptor extends AbstractProvider implements NestInterceptor {

  /**
   * If returning data contain entity classes, calls their stringify method
   * to prevent sending private data or exceeding call stack size
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    return next
      .handle()
      .pipe(
        map((data) => {
          if (data && Array.isArray(data)) {
            data = data.map((d) => d && d.toJSON ? d.toJSON() : d);
          }
          else if (data && data.results && Array.isArray(data.results)) {
            data.results = data.results.map((d) => d && d.toJSON ? d.toJSON() : d);
          }
          else if (data && data.toJSON) {
            data = data.toJSON();
          }
          return data;
        }),
      );
  }

}
