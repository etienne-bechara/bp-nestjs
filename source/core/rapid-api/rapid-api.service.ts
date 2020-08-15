import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { AppProvider } from '../app/app.provider';
import { HttpsService } from '../https/https.service';
import { RapidApiMailCheck } from './rapid-api.interface';
import { RapidApiSettings } from './rapid-api.settings';

@Injectable()
export class RapidApiService extends AppProvider {
  private settings: RapidApiSettings = this.getSettings();
  private enabled: boolean;

  /** */
  public constructor(private readonly httpsService: HttpsService) {
    super();
    if (this.settings.RAPID_API_KEY) {
      this.httpsService.setupInstance({
        baseUrl: this.settings.RAPID_API_HOST,
        baseHeaders: { 'x-rapidapi-key': this.settings.RAPID_API_KEY },
      });
      this.logger.success('[ENABLED] RapidAPI integration', { private: true });
      this.enabled = true;
    }
    else {
      this.logger.warning('[DISABLED] RapidAPI integration', { private: true });
      this.enabled = false;
    }
  }

  /**
   * Throw if integration is not configured
   * Used at the beggining of all methods
   */
  private checkRapidApiIntegration(): void {
    if (!this.enabled) {
      throw new InternalServerErrorException({
        message: 'RapidAPI integation is DISABLED',
      });
    }
  }

  /**
   * Checks if given email or domain is trustable
   * @param email
   */
  public async checkEmailDomain(email: string): Promise<RapidApiMailCheck> {
    this.checkRapidApiIntegration();

    const data = await this.httpsService.get<RapidApiMailCheck>('/', {
      replacements: { app_name: 'mailcheck' },
      params: {
        disable_test_connection: false,
        email,
      },
    });

    // Fix a bug in ther API where booleans returns as strings
    if (typeof data.block === 'string') data.block = data.block !== '0';
    if (typeof data.valid === 'string') data.valid = data.valid !== '0';
    if (typeof data.disposable === 'string') data.disposable = data.disposable !== '0';
    return data;
  }

}
