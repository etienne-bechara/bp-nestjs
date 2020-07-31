/* eslint-disable no-console */

import dotenv from 'dotenv';

/**
 * Runs a test group mocking console.log and console.info
 * @param name
 * @param fn
 */
export const describeSilent = (name: string, fn): void => {
  console.log = jest.fn();
  console.info = jest.fn();
  fn();
};

/**
 * Describes a test only if desired environment variable
 * is present
 * @param variable
 */
export const describeIfEnv = (variable: string, silent: boolean, name: string, fn: jest.EmptyFunction): void => {
  const variableExists = dotenv.config().parsed[variable];
  if (!variableExists) {
    describe.skip(name, fn);
  }
  else if (silent) {
    describeSilent(name, fn);
  }
  else {
    describe(name, fn);
  }
};
