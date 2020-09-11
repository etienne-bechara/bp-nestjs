import { Injectable } from '@nestjs/common';

import { AppProvider } from '../core/app/app.provider';

@Injectable()
export class PascalCaseService extends AppProvider {

}
