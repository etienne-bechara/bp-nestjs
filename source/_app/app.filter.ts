import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ServerResponse } from 'http';

import { AbstractProvider } from '../_abstract/abstract.provider';
import { AppEnvironment } from './app.enum';

@Catch()
export class AppFilter extends AbstractProvider implements ExceptionFilter {
  /** */
  public constructor() { super(); }

  /**
   * Intercepts all erros and standardize the output
   * @param exception
   * @param host
   */
  public async catch(exception: HttpException | Error, host: ArgumentsHost): Promise<void> {
    const nodeEnv = this.settings.NODE_ENV;

    const ctx = host.switchToHttp();
    const res: FastifyReply<ServerResponse> | ServerResponse = ctx.getResponse();

    const error = this.getErrorCode(exception);
    let message = this.getMessage(exception);
    let details = this.getDetails(exception);

    // Logs the incident according to status type, remove error message on production
    if (error === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception, { message, details });
      if (nodeEnv === AppEnvironment.PRODUCTION) {
        message = 'unexpected error';
        details = { };
      }
    }
    else {
      this.logger.info(exception, { message, details });
    }

    // Response object may have two different types depending on whether or not
    // the request reached a controller. So identify it and act accordingly
    if (res instanceof ServerResponse) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = error;
      res.end(JSON.stringify({ error, message, details }));
    }
    else {
      res.status(error).send({ error, message, details });
    }
  }

  /**
   * Given an exception, determines the correct status code
   * @param exception
   */
  private getErrorCode(exception: HttpException | Error): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Given an exception, extracts a detailing message
   * @param exception
   */
  private getMessage(exception: HttpException | Error): string {
    let message;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      message = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST) {
        const constraints = Array.isArray(message['message'])
          ? message['message']
          : [ message['message'] ];

        message = constraints.length > 1
          ? 'request validation failed'
          : constraints[0];
      }
      else if (message && typeof message === 'object') {
        if (message['message'] && typeof message['message'] === 'string') {
          message = message['message'];
        }
      }
    }
    else {
      message = exception.message;
    }

    return message && typeof message === 'string'
      ? message
      : 'unexpected error';
  }

  /**
   * Given an exception, extracts its details
   * @param exception
   */
  private getDetails(exception: HttpException | Error): unknown {
    let details: unknown;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      details = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST) {
        const constraints = Array.isArray(details['message'])
          ? details['message']
          : [ details['message'] ];

        details = constraints.length > 1
          ? details = { constraints }
          : { };

      }
      else if (details && typeof details === 'object') {
        delete details['statusCode'];
        delete details['message'];
        delete details['error'];
      }
    }

    return details || { };
  }

}
