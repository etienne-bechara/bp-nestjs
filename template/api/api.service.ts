import { Injectable } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { HttpsService } from '../core/https/https.service';
import { PascalCaseSettings } from './dot.case.settings';

@Injectable()
export class PascalCaseService extends AppProvider {
  private settings: PascalCaseSettings = this.getSettings();

  /**
   * Instantiate an exclusive http service for PascalCase API.
   * @param httpsService
   */
  public constructor(private readonly httpsService: HttpsService) {
    super();
    this.httpsService.setupInstance({
      bases: {
        url: this.settings.UPPER_CASE_HOST,
        headers: { 'authorization': this.settings.UPPER_CASE_API_KEY },
      },
    });
  }

  /* Implement you API methods here */

  // public async readUsers(): Promise<PascalCaseUser[]> {
  //   return this.httpsService.get('/users');
  // }

}
