import { DemoChildController } from './demo.child/demo.child.controller';
import { DemoChildRepository } from './demo.child/demo.child.repository';
import { DemoChildService } from './demo.child/demo.child.service';
import { DemoController } from './demo/demo.controller';
import { DemoRepository } from './demo/demo.repository';
import { DemoService } from './demo/demo.service';

/** Your Application Repositories */
export const Repositories = [
  DemoRepository,
  DemoChildRepository,
];

/** Your Application Controllers */
export const Controllers = [
  DemoController,
  DemoChildController,
];

/** Your Application Services, Guards and Middlewares */
export const Providers = [
  DemoService,
  DemoChildService,
];
