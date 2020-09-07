import { FindOptions } from '@mikro-orm/core';

export interface OrmFindOptions<Entity> extends FindOptions<Entity> {
  order?: string;
}
