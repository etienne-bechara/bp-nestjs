import 'source-map-support/register';

import { AppModule } from './app/app.module';
import { UtilService } from './util/util.service';

void AppModule.bootServer({
  envPath: `${__dirname}/../../.env`,
  configs: UtilService.globToRequire('./**/*.config.{js,ts}'),
  modules: UtilService.globToRequire([
    './**/*.module.{js,ts}',
    '!./**/app.module.{js,ts}',
    '!./**/config.module.{js,ts}',
  ]).reverse(),
});
