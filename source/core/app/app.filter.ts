import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ServerResponse } from 'http';

import { AppEnvironment } from './app.enum';
import { AppProvider } from './app.provider';
import { AppSettings } from './app.settings';

@Catch()
export class AppFilter extends AppProvider implements ExceptionFilter {
  private settings: AppSettings = this.getSettings();

  /** */
  public constructor() { super(); }

  /**
   * Intercepts all erros and standardize the output
   * @param exception
   * @param host
   */
  public async catch(exception: HttpException | Error, host: ArgumentsHost): Promise<void> {
    const res: ServerResponse = host.switchToHttp().getResponse();
    const nodeEnv = this.settings.NODE_ENV;

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

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = error;
    res.end(JSON.stringify({ error, message, details }));
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
        message = 'request validation failed';
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
        details = { constraints };
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
