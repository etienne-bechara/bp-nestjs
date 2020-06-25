import { ClassType } from 'class-transformer/ClassTransformer';

export interface AbstractControllerOptions {
  dto?: {
    create: ClassType<unknown>,
    update: ClassType<unknown>
  }
}
