import { Test } from '@nestjs/testing';
import dotenv from 'dotenv';

import { AppModule } from '../app/app.module';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
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
    // Skip if criteria matches
    if (options.skipIfNoEnv) {
      const variableExists = dotenv.config().parsed[options.skipIfNoEnv];

      if (!variableExists) {
        // eslint-disable-next-line jest/valid-title, jest/no-disabled-tests
        describe.skip(options.name, () => options.descriptor(null));
        return;
      }
    }

    // Creates the testing builder exposed to specific test
    const testingBuilder = Test.createTestingModule({
      imports: [
        AppModule,
        ...options.imports ? options.imports : [ ],
      ],
      providers: [
        ConfigService,
        LoggerService,
        ...options.providers ? options.providers : [ ],
      ],
      controllers: [
        ...options.controllers ? options.controllers : [ ],
      ],
    });

    // Silence internal console and run provided descriptor
    // eslint-disable-next-line jest/valid-title
    describe(options.name, () => {
      // eslint-disable-next-line no-console
      console.log = jest.fn(); console.info = jest.fn();
      options.descriptor(testingBuilder);
    });
  }

}
