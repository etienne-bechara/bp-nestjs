import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../core/test/test.service';
import { PascalCaseConfig } from './dot.case.config';
import { PascalCaseService } from './dot.case.service';

TestService.createSandbox({
  name: 'PascalCaseService',
  providers: [ PascalCaseService, PascalCaseConfig ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let camelCaseService: PascalCaseService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      camelCaseService = testingModule.get(PascalCaseService);
    });

    describe('instance', () => {
      it('should instantiate properly', () => {
        expect(camelCaseService).toBeDefined();
      });
    });
  },

});
