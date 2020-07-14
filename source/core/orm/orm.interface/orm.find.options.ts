import { FindOptions } from 'mikro-orm';

export interface OrmFindOptions extends FindOptions {
  order?: string;
}
