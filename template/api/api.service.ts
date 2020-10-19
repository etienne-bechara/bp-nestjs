import { Injectable } from '@nestjs/common';

import { HttpsService } from '../core/https/https.service';
import { LoggerService } from '../core/logger/logger.service';

@Injectable()
export class PascalCaseService {

  /**
   * Instantiate an exclusive http service for PascalCase API.
   * @param configService
   * @param loggerService
   * @param httpsService
   */
  public constructor(
    private readonly loggerService: LoggerService,
    private readonly httpsService: HttpsService,
  ) { }

  /* Implement you API methods here */

  // public async readUsers(): Promise<PascalCaseUser[]> {
  //   return this.httpsService.get('/users');
  // }

}
