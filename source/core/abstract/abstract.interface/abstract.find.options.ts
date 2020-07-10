import { FindOptions } from 'mikro-orm';

export interface AbstractFindOptions extends FindOptions {
  order?: string;
}
