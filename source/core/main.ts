import 'source-map-support/register';

import { AppService } from './app/app.service';

const appService = new AppService();
void appService.bootServer();
