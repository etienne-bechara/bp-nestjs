import { TestingModuleBuilder } from '@nestjs/testing';

export interface TestSandboxOptions {
  name: string;
  descriptor: (testingBuilder: TestingModuleBuilder)=> void;
  skipIfNoEnv?: string;
  providers?: any[];
  controllers?: any[];
}
