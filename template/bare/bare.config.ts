import { Injectable } from '@nestjs/common';

import { ConfigService } from '../core/config/config.service';

@Injectable() export class PascalCaseConfig extends ConfigService {

}
