import { TestingModuleBuilder } from '@nestjs/testing';

import { HttpsModule } from '../core/https/https.module';
import { TestService } from '../core/test/test.service';
import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseService } from './dot.case.service';

const camelCaseConfig = new PascalCaseConfig();

TestService.createSandbox({
  name: 'PascalCaseService',
  imports: [
    HttpsModule.register({
      bases: {
        url: camelCaseConfig.UPPER_CASE_HOST,
        headers: {
          authorization: camelCaseConfig.UPPER_CASE_KEY,
        },
      },
    }),
  ],
  providers: [ PascalCaseService ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let camelCaseService: PascalCaseService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      camelCaseService = testingModule.get(PascalCaseService);
    });

    describe('injection', () => {
      it('should resolve dependency injection', () => {
        expect(camelCaseService).toBeDefined();
      });
    });
  },

});
