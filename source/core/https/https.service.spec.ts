import { HttpStatus } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';

import { TestService } from '../test/test.service';
import { UtilService } from '../util/util.service';
import { HttpsModule } from './https.module';
import { HttpsService } from './https.service';

TestService.createSandbox({
  name: 'HttpsService',
  imports: [ HttpsModule.register({ }) ],
  providers: [ HttpsService, UtilService ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpsService: HttpsService;

    beforeEach(async () => {
      const testingModule = await testingBuilder.compile();
      httpsService = await testingModule.resolve(HttpsService);
    });

    describe('request', () => {

      it('should GET Google homepage', async () => {
        const data = await httpsService.get('https://www.google.com');
        expect(data).toMatch(/google/gi);
      });

      it('should throw a timeout exception', async () => {
        let errorMessage: string;
        try {
          await httpsService.get('https://www.google.com', {
            timeout: 1,
          });
        }
        catch (e) {
          errorMessage = e.message;
        }
        expect(errorMessage).toMatch(/timed out/gi);
      });

      it('should throw an internal server error exception', async () => {
        let errorStatus: number;
        try {
          await httpsService.get('https://www.google.com/404');
        }
        catch (e) {
          errorStatus = e.status;
        }
        expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      });

    });

  },

});
