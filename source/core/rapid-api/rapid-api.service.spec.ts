import { Test } from '@nestjs/testing';

import { describeIfEnv } from '../../../test/test.utils';
import { HttpsModule } from '../https/https.module';
import { HttpsService } from '../https/https.service';
import { RapidApiService } from './rapid-api.service';

describeIfEnv('RAPID_API_AUTH', true, 'RapidApiService', () => {
  let rapidApiService: RapidApiService;

  beforeEach(async() => {
    const testModule = await Test.createTestingModule({
      imports: [ HttpsModule ],
      providers: [ RapidApiService, HttpsService ],
    }).compile();

    rapidApiService = testModule.get(RapidApiService);
  });

  describe('checkEmailDomain', () => {

    it('should flag e-mail as valid', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@gmail.com'))
        .toMatchObject({ valid: true, block: false, disposable: false });
    });

    it('should flag e-mail as disposable', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@temp-mail.com'))
        .toMatchObject({ disposable: true });
    });

    it('should flag e-mail as invalid', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@hf8d9sahgbf8io.com'))
        .toMatchObject({ valid: false });
    });

  });
});

