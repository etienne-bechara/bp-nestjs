import { Injectable } from '@nestjs/common';

import { ConfigService } from '../core/config/config.service';
import { HttpsService } from '../core/https/https.service';
import { LoggerService } from '../core/logger/logger.service';
import { PascalCaseConfig } from './dot.case.config';

@Injectable()
export class PascalCaseService {

  /**
   * Instantiate an exclusive http service for PascalCase API.
   * @param configService
   * @param loggerService
   * @param httpsService
   */
  public constructor(
    private readonly configService: ConfigService<PascalCaseConfig>,
    private readonly loggerService: LoggerService,
    private readonly httpsService: HttpsService,
  ) {
    this.httpsService.setupInstance({
      bases: {
        url: this.configService.get('UPPER_CASE_HOST'),
        headers: {
          'authorization': this.configService.get('UPPER_CASE_API_KEY'),
        },
      },
    });
  }

  /* Implement you API methods here */

  // public async readUsers(): Promise<PascalCaseUser[]> {
  //   return this.httpsService.get('/users');
  // }

}
