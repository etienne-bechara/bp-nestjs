import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../test/test.service';
import { UtilService } from './util.service';

const mockFailure = (c): void => {
  c.quantity++;
  throw new Error('error');
};

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

    describe('retryOnException', () => {
      it('should retry a function for 5 times', async () => {
        const counter = { quantity: 0 };
        const retries = 5;

        try {
          await utilService.retryOnException({
            method: () => mockFailure(counter),
            retries,
          });
        }
        catch { /* Handled by expect */ }

        expect(counter.quantity).toBe(retries + 1);
      });

      it('should retry a function for 2 seconds', async () => {
        const counter = { quantity: 0 };
        const timeout = 2000;
        const delay = 550;

        try {
          await utilService.retryOnException({
            method: () => mockFailure(counter),
            timeout,
            delay,
          });
        }
        catch { /* Handled by expect */ }

        expect(counter.quantity).toBe(Math.ceil(timeout / delay) + 1);
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
