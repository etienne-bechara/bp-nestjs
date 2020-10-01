import { Injectable } from '@nestjs/common';

import { ConfigService } from '../core/config/config.service';
import { LoggerService } from '../core/logger/logger.service';
import { PascalCaseConfig } from './dot.case.config';

@Injectable()
export class PascalCaseService {

  public constructor(
    private readonly configService: ConfigService<PascalCaseConfig>,
    private readonly loggerService: LoggerService,
  ) { }

}
