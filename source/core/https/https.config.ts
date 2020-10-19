import { Injectable } from '@nestjs/common';

import { ConfigService } from '../config/config.service';

@Injectable()
export class HttpsConfig extends ConfigService {

  /* Service Settings */
  public readonly HTTPS_DEFAULT_TIMEOUT = 60 * 1000;

  /* Injection Tokens */
  public static readonly HTTPS_MODULE_ID_TOKEN = 'HTTPS_MODULE_ID_TOKEN';
  public static readonly HTTPS_MODULE_OPTIONS_TOKEN = 'HTTPS_MODULE_OPTIONS_TOKEN';

}
