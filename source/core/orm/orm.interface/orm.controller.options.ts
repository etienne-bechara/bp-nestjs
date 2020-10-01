import { ClassType } from 'class-transformer/ClassTransformer';

import { OrmControllerMethod } from '../orm.enum';

export interface OrmControllerOptions {
  routes?: {
    only?: OrmControllerMethod[];
    exclude?: OrmControllerMethod[];
  };
  dto?: {
    create?: ClassType<unknown>;
    update?: ClassType<unknown>;
    read?: ClassType<unknown>;
  };
}
