import { IsIn, IsNumber } from 'class-validator';

import { AppEnvironment } from '../../app/app.enum';
import { InjectSecret } from '../../config/config.decorator';

export class MockConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @IsNumber()
  public readonly SECRET_NUMBER = 'one';

}
