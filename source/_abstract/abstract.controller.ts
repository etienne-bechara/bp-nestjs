import { BadRequestException, Body, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AbstractProvider } from './abstract.provider';
import { AbstractService } from './abstract.service';
import { AbstractUuidDto } from './dto/abstract.uuid.dto';
import { AbstractControllerOptions } from './interfaces/abstract.controller.options';

/**
 * Implements a very simples CRUD controller that
 * can be extended to prevent duplicate code
 */
export class AbstractController<Entity> extends AbstractProvider {

  /** */
  public constructor(
    private readonly service: AbstractService<Entity>,
    private readonly options: AbstractControllerOptions,
  ) {
    super();
  }

  /**
   * Returns a single entity by its id
   * @param params
   */
  @Get(':id')
  public async getEntityById(@Param() params: AbstractUuidDto): Promise<Entity> {
    return this.service.readEntityById(params.id);
  }

  /**
   * Creates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Post()
  public async postEntity(@Body() body: DeepPartial<Entity>): Promise<Entity> {
    const errors = await this.validate(body, this.options.dto.create);
    if (errors.length > 0) throw new BadRequestException(errors);
    return this.service.createEntity(body);
  }

  /**
   * Updates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Put(':id')
  public async putEntityById(@Param() params: AbstractUuidDto, @Body() body: DeepPartial<Entity>): Promise<Entity> {
    const errors = await this.validate(body, this.options.dto.update);
    if (errors.length > 0) throw new BadRequestException(errors);
    return this.service.updateById(params.id, body);
  }

  /**
   * Deletes a single entity by its id
   * @param body
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteEntityById(@Param() params: AbstractUuidDto): Promise<void> {
    return this.service.deleteById(params.id);
  }

}
