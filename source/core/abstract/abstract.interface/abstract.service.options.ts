/* eslint-disable @typescript-eslint/no-explicit-any */

import { AbstractService } from '../abstract.service';

export interface AbstractServiceOptions {
  populate?: boolean | string[]
  collections?: {
    name: string;
    provider: AbstractService<any>;
    reference: string;
  }[];
}
