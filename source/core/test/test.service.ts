import { Test } from '@nestjs/testing';

import { AppModule } from '../app/app.module';
import { HttpsConfig } from '../https/https.config';
import { HttpsModule } from '../https/https.module';
import { HttpsService } from '../https/https.service';
import { LoggerConfig } from '../logger/logger.config';
import { LoggerService } from '../logger/logger.service';
import { UtilService } from '../util/util.service';
import { TestSandboxOptions } from './test.interface';

/**
 * This is not an injectable, it serves the purpose of exposing
 * static methods that facilitates execution of tests.
 */
export class TestService {

  /**
   * Creates a testing sandbox abstracting the instantiation of
   * mandatory providers and adding custom skip conditions.
   * @param options
   */
  public static createSandbox(options: TestSandboxOptions): void {
    if (options.skip) {
      // eslint-disable-next-line jest/valid-title, jest/no-disabled-tests
      describe.skip(options.name, () => options.descriptor(null));
      return;
    }

    const testingBuilder = Test.createTestingModule({
      imports: [
        ...options.global ? [ AppModule ] : [ ],
        ...options.imports ? options.imports : [ ],
        HttpsModule.register(),
      ],

      providers: [
        HttpsConfig,
        HttpsService,
        LoggerConfig,
        LoggerService,
        UtilService,
        ...options.providers ? options.providers : [ ],
      ],

      controllers: [
        ...options.controllers ? options.controllers : [ ],
      ],

      exports: [
        ...options.exports ? options.exports : [ ],
      ],
    });

    describe(options.name, () => { // eslint-disable-line jest/valid-title
      console.log = jest.fn(); console.warn = jest.fn(); // eslint-disable-line no-console
      options.descriptor(testingBuilder);
    });
  }

}
