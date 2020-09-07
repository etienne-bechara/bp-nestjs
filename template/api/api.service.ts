import { Injectable } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';
import { HttpsService } from '../core/https/https.service';
import { _Pascal_Settings } from './_Dot_.settings';

@Injectable()
export class _Pascal_Service extends AppProvider {
  private settings: _Pascal_Settings = this.getSettings();

  /**
   * Instantiate an exclusive http service for _Pascal_ API.
   * @param httpsService
   */
  public constructor(private readonly httpsService: HttpsService) {
    super();
    this.httpsService.setupInstance({
      bases: {
        url: this.settings._Constant__HOST,
        headers: { 'Authorization': this.settings._Constant__API_KEY },
      },
    });
  }

  /* Implement you API methods here */

  // public async readUsers(): Promise<_Pascal_User[]> {
  //   return this.httpsService.get('/users');
  // }

}
