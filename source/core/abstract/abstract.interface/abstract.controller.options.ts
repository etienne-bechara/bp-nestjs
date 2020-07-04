import { ClassType } from 'class-transformer/ClassTransformer';

import { AbstractControllerMethod } from '../abstract.enum';

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
