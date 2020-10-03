import { TestingModuleBuilder } from '@nestjs/testing';

export interface TestSandboxOptions {
  name: string;
  descriptor: (testingBuilder: TestingModuleBuilder)=> void;
  skipIfNoEnv?: string;
  imports?: any[];
  providers?: any[];
  controllers?: any[];
}
