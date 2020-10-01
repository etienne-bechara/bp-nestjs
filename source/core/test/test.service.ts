/* eslint-disable no-console */

import { Test } from '@nestjs/testing';
import dotenv from 'dotenv';

import { ConfigModule } from '../config/config.module';
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
        describe.skip(options.name, () => options.descriptor(null));
        return;
      }
    }

    // Creates the testing builder exposed to specific test
    const testingBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(),
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
    describe(options.name, () => {
      console.log = jest.fn();
      console.info = jest.fn();
      options.descriptor(testingBuilder);
    });
  }

  /**
   * Runs a test group mocking console.log and console.info.
   * @param name
   * @param fn
   */
  public static describeSilent(name: string, fn: any): void {
    console.log = jest.fn();
    console.info = jest.fn();
    fn();
  }

  /**
   * Describes a test only if desired environment variable
   * is present.
   * @param variable
   * @param silent
   * @param name
   * @param fn
   */
  public static describeIfEnv(variable: string, silent: boolean, name: string, fn: jest.EmptyFunction): void {
    const variableExists = dotenv.config().parsed[variable];
    if (!variableExists) {
      describe.skip(name, fn);
    }
    else if (silent) {
      TestService.describeSilent(name, fn);
    }
    else {
      describe(name, fn);
    }
  }

}
