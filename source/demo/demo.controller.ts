import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DemoService } from './demo.service';
import { DemoData } from './interfaces/demo.data';
import { DemoGetIdParams } from './interfaces/demo.get.id.params';

@Controller('demo')
export class DemoController {

  /** */
  public constructor(private readonly demoService: DemoService) { }

  /**
   * Returns a demo data by id
   * Used to demonstrate type transformation through decorators
   * Refer to ./interfaces.demo.get.id.ts
   */
  @Get(':id')
  public async getDemoById(@Param() params: DemoGetIdParams): Promise<DemoData[]> {
    return this.demoService.readDemoById(params);
  }

  /**
   * Reads a demo data by id
   * Used to demonstrate body validation through decorators
   * Refer to ./interfaces.demo.data.ts
   * @param body
   */
  @Post()
  public async createDemo(@Body() body: DemoData): Promise<DemoData> {
    return this.demoService.createDemo(body);
  }

}
