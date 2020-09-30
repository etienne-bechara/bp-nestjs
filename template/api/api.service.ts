import { Injectable } from '@nestjs/common';

import { HttpsService } from '../core/https/https.service';
import { PascalCaseConfig } from './dot.case.config';

@Injectable()
export class PascalCaseService {
  private config: PascalCaseConfig = this.getConfig();

  /**
   * Instantiate an exclusive http service for PascalCase API.
   * @param httpsService
   */
  public constructor(private readonly httpsService: HttpsService) {

    this.httpsService.setupInstance({
      bases: {
        url: this.config.UPPER_CASE_HOST,
        headers: { 'authorization': this.config.UPPER_CASE_API_KEY },
      },
    });
  }

  /* Implement you API methods here */

  // public async readUsers(): Promise<PascalCaseUser[]> {
  //   return this.httpsService.get('/users');
  // }

}
