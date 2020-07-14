/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OrmEntityInterceptor implements NestInterceptor {

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
          if (data) {
            if (Array.isArray(data)) {
              data = data.map((d) => d && d.toJSON ? d.toJSON() : d);
              for (const d of data) {
                this.eliminateRecursion(d.id, d);
              }
            }
            else if (data.results && Array.isArray(data.results)) {
              data.results = data.results.map((d) => d && d.toJSON ? d.toJSON() : d);
              for (const d of data.results) {
                this.eliminateRecursion(d.id, d);
              }
            }
            else if (data.toJSON) {
              data = data.toJSON();
              this.eliminateRecursion(data.id, data);
            }
          }
          return data;
        }),
      );
  }

  /**
   * Given an object, eliminate properties that references
   * defined parent id
   * @param data
   */
  private eliminateRecursion(parentId: string, data: any): void {
    if (!data || !parentId) return undefined;

    if (Array.isArray(data)) {
      for (const d of data) {
        this.eliminateRecursion(parentId, d);
      }
    }
    else if (typeof data === 'object') {
      for (const key in data) {
        if (typeof data[key] === 'object') {
          this.eliminateRecursion(parentId, data[key]);
        }
        else if (key !== 'id' && data[key] === parentId) {
          delete data[key];
        }
      }
    }
  }

}
