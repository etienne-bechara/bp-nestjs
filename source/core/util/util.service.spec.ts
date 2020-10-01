import { Test } from '@nestjs/testing';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { StaticService } from '../static/static.service';
import { UtilService } from './util.service';

StaticService.describeSilent('UtilService', () => {
  let utilService: UtilService;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [ ConfigModule.forRootAsync() ],
      providers: [ ConfigService, UtilService, LoggerService ],
    }).compile();

    utilService = testModule.get(UtilService);
  });

  describe('halt', () => {
    it('it should halt code execution for 1000ms', async () => {
      const haltTime = 1000;
      const start = new Date().getTime();
      await utilService.halt(haltTime);
      const elapsed = new Date().getTime() - start;
      expect(elapsed).toBeGreaterThan(haltTime * 0.95);
      expect(elapsed).toBeLessThan(haltTime * 1.05);
    });
  });

});
