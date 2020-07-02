import { ClassType } from 'class-transformer/ClassTransformer';

export type AbstractControllerMethod = 'get' | 'getById' | 'post' | 'putById' | 'deleteById';

export interface AbstractControllerOptions {
  routes?: {
    only?: AbstractControllerMethod[];
    exclude?: AbstractControllerMethod[];
  },
  dto?: {
    create?: ClassType<unknown>,
    update?: ClassType<unknown>,
    read?: ClassType<unknown>,
  }
}
