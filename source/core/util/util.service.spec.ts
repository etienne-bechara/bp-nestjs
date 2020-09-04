import { Test } from '@nestjs/testing';

import { UtilService } from './util.service';

UtilService.describeSilent('UtilService', () => {
  let utilService: UtilService;

  beforeAll(async() => {
    const testModule = await Test.createTestingModule({
      providers: [ UtilService ],
    }).compile();

    utilService = testModule.get(UtilService);
  });

  describe('halt', () => {
    it('it should halt code execution for 1000ms', async() => {
      const haltTime = 1000;
      const start = new Date().getTime();
      await utilService.halt(haltTime);
      const elapsed = new Date().getTime() - start;
      expect(elapsed).toBeGreaterThan(haltTime * 0.95);
      expect(elapsed).toBeLessThan(haltTime * 1.05);
    });
  });

});
