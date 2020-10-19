import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { ConfigService } from '../core/config/config.service';

@Injectable()
export class PascalCaseConfig extends ConfigService {

  /* Environment Variables */
  @IsUrl()
  public readonly UPPER_CASE_HOST: string;

  @IsString() @IsNotEmpty()
  public readonly UPPER_CASE_API_KEY: string;

}
