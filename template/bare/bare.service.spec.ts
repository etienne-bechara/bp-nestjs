import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../core/test/test.service';
import { PascalCaseService } from './dot.case.service';

TestService.createSandbox({
  name: 'PascalCaseService',
  providers: [ PascalCaseService ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let camelCaseService: PascalCaseService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      camelCaseService = testingModule.get(PascalCaseService);
    });

    describe('instance', () => {
      it('should initialize correctly', () => {
        expect(camelCaseService).toBeDefined();
      });
    });
  },

});
