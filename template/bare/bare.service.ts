import { Injectable } from '@nestjs/common';

import { LoggerService } from '../core/logger/logger.service';
import { PascalCaseConfig } from './dot.case.config';

@Injectable()
export class PascalCaseService {

  public constructor(
    private readonly camelCaseConfig: PascalCaseConfig,
    private readonly loggerService: LoggerService,
  ) { }

}
