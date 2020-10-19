import { TestingModuleBuilder } from '@nestjs/testing';

export interface TestSandboxOptions {
  name: string;
  descriptor: (testingBuilder: TestingModuleBuilder) => void;
  global?: boolean;
  skip?: boolean;
  imports?: any[];
  providers?: any[];
  controllers?: any[];
}
