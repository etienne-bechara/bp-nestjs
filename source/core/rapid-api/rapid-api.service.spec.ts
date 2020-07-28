import { Test } from '@nestjs/testing';

import { describeIfEnv } from '../../../test/test.utils';
import { HttpsModule } from '../https/https.module';
import { HttpsService } from '../https/https.service';
import { RapidApiService } from './rapid-api.service';

describeIfEnv('RAPID_API_AUTH', true, 'RapidApiService', () => {
  let rapidApiService: RapidApiService;

  beforeAll(async() => {
    const testModule = await Test.createTestingModule({
      imports: [ HttpsModule ],
      providers: [ RapidApiService, HttpsService ],
    }).compile();

    rapidApiService = testModule.get(RapidApiService);
  });

  describe('checkEmailDomain', () => {

    it('should flag @gmail.com as valid', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@gmail.com'))
        .toMatchObject({ valid: true, block: false, disposable: false });
    });

    it('should flag @temp-mail.com as disposable', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@temp-mail.com'))
        .toMatchObject({ disposable: true });
    });

    it('should flag @gj87ghb as invalid', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@gj87ghb.com'))
        .toMatchObject({ valid: false });
    });
  });

});
