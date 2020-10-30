import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class PascalCaseConfig {

  @InjectSecret()
  @IsUrl()
  public readonly UPPER_CASE_HOST: string;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly UPPER_CASE_API_KEY: string;

}
