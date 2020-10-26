import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../core/test/test.service';
import { PascalCaseService } from './dot.case.service';

TestService.createSandbox({
  name: 'PascalCaseService',
  global: true,
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
