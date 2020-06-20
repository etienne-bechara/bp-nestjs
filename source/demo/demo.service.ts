
import { Injectable } from '@nestjs/common';

import { CommonProvider } from '../_common/common.provider';
import { HttpsService } from '../_https/https.service';
import { DemoData } from './interfaces/demo.data';
import { DemoGetIdParams } from './interfaces/demo.get.id.params';

@Injectable()
export class DemoService extends CommonProvider {

  /** */
  public constructor(private readonly httpsService: HttpsService) {
    super();
    this.httpsService.setupInstance({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });
  }

  /**
   * Reads a demo resource by its id
   */
  public async readDemoById(params: DemoGetIdParams): Promise<DemoData[]> {
    return this.httpsService.get('/posts/:id', {
      replacements: {
        id: params.id,
      },
    });
  }

  /**
   * Creates a new resource
   * @param data
   */
  public async createDemo(data: DemoData): Promise<DemoData> {
    return this.httpsService.post('/posts', { data });
  }

}
