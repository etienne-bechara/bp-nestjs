import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../test/test.service';
import { UtilService } from './util.service';

TestService.createSandbox({
  name: 'UtilService',
  providers: [ UtilService ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let utilService: UtilService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      utilService = testingModule.get(UtilService);
    });

    describe('halt', () => {
      it('should halt code execution for 1000ms', async () => {
        const haltTime = 1000;
        const start = new Date().getTime();
        await utilService.halt(haltTime);
        const elapsed = new Date().getTime() - start;
        expect(elapsed).toBeGreaterThan(haltTime * 0.95);
        expect(elapsed).toBeLessThan(haltTime * 1.05);
      });
    });

    describe('getAppStatus', () => {
      it('should read application cpu, memory and network', async () => {
        const appStatus = await utilService.getAppStatus();
        expect(appStatus.system.uptime).toBeGreaterThan(0);
        expect(appStatus.memory.total).toBeGreaterThan(0);
        expect(appStatus.cpus.length).toBeGreaterThan(0);
        expect(appStatus.network.public_ip).toBeDefined();
      });
    });
  },

});
