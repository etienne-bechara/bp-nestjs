import { BadRequestException, Body, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Post, Put, Query } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate } from 'class-validator';
import { unflatten } from 'flat';

import { AbstractIdDto, AbstractPartialDto } from './abstract.dto';
import { AbstractControllerMethod, AbstractControllerOptions, AbstractPartialResponse } from './abstract.interface';
import { AbstractProvider } from './abstract.provider';
import { AbstractService } from './abstract.service';

/**
 * Implements a very simples CRUD controller that
 * can be extended to prevent duplicate code
 */
export abstract class AbstractController<Entity> extends AbstractProvider {
  public MISSING_DTO_MESSAGE: string = 'missing dto implementation';
  public MISSING_BODY_MESSAGE: string = 'missing request body';

  /** */
  public constructor(
    public readonly service: AbstractService<Entity>,
    public readonly options: AbstractControllerOptions = { },
  ) {
    super();
    if (!options.dto) options.dto = { };
    if (!options.routes) options.routes = { };
  }

  /**
   * Read all entitties that matches desired criterias
   * @param query
   */
  @Get()
  public async getEntities(@Query() query: Entity & AbstractPartialDto): Promise<Entity[] | AbstractPartialResponse<Entity>> {
    await this.checkImplementation('get');
    const { data, partial } = await this.plainToDtoOffset(unflatten(query), this.options.dto.read);
    return this.service.readEntities(data, partial);
  }

  /**
   * Read a single entity by its id
   * @param params
   */
  @Get(':id')
  public async getEntityById(@Param() params: AbstractIdDto<Entity>): Promise<Entity> {
    await this.checkImplementation('getById');
    return this.service.readEntityById(params.id);
  }

  /**
   * Creates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Post()
  public async postEntity(@Body() body: Entity): Promise<Entity> {
    await this.checkImplementation('post');
    if (!body) throw new BadRequestException(this.MISSING_BODY_MESSAGE);

    const dto = await this.plainToDto(body, this.options.dto.create);
    return this.service.createEntity(dto);
  }

  /**
   * Updates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Put(':id')
  public async putEntityById(@Param() params: AbstractIdDto<Entity>, @Body() body: Entity): Promise<Entity> {
    await this.checkImplementation('putById');
    if (!body) throw new BadRequestException(this.MISSING_BODY_MESSAGE);

    const dto = await this.plainToDto(body, this.options.dto.update);
    return this.service.updateEntityById(params.id, dto);
  }

  /**
   * Deletes a single entity by its id
   * @param body
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteEntityById(@Param() params: AbstractIdDto<Entity>): Promise<void> {
    await this.checkImplementation('deleteById');
    return this.service.deleteEntityById(params.id);
  }

  /**
   * Validates if a given method is allowed to procede
   * @param method
   */
  public async checkImplementation(method: AbstractControllerMethod): Promise<void> {

    if (
      this.options.routes.exclude && this.options.routes.exclude.includes(method) ||
      this.options.routes.only && !this.options.routes.only.includes(method)
    ) {
      throw new NotFoundException(`Cannot ${method.split('By')[0].toUpperCase()} to path`);
    }

    if (
      method === 'get' && !this.options.dto.read ||
      method === 'post' && !this.options.dto.create ||
      method === 'putById' && !this.options.dto.update
    ) {
      throw new NotImplementedException(this.MISSING_DTO_MESSAGE);
    }

  }

  /**
   * Unflatten an object with nested entities by transforming
   * keys in {name}_id standard to name: { id: string | number}
   * @param object
   */
  public async unflatten(object: unknown): Promise<void> {
    Object.keys(object).map((key) => {
      if (key.endsWith('_id')) {
        object[key.slice(0, -3)] = { id: object[key] };
        delete object[key];
      }
    });
  }

  /**
   * Transforms an object into desired type, returns the typed
   * object or throws an exception with array of constraints
   * @param object
   * @param type
   */
  public async plainToDto(object: unknown, type: ClassType<unknown>): Promise<any> { // eslint-disable-line

    const typedObject = plainToClass(type, object);
    const failedConstraints = await validate(typedObject, this.settings.APP_VALIDATION_RULES);
    const errors: string[] = [ ];

    for (const failure of failedConstraints) {
      if (failure.children) {
        failure.children = failure.children.map((c) => {
          return { parent: failure.property, ...c };
        });
        failedConstraints.push(...failure.children);
      }
      if (failure.constraints) {
        let partials = Object.values(failure.constraints);
        if (failure['parent']) {
          partials = partials.map((p) => `${failure['parent']}: ${p}`);
        }
        errors.push(...partials);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return typedObject;
  }

  /**
   * Transforms an object merged with pagination interface, into two separate
   * types, if validation fails, throws an exception with array of constraints
   * @param object
   * @param type
   */
  public async plainToDtoOffset(object: unknown, type: ClassType<unknown>): Promise<{ data: any, partial: any }> { // eslint-disable-line

    const dataObject = JSON.parse(JSON.stringify(object));
    delete dataObject.limit;
    delete dataObject.offset;

    const partialObject = JSON.parse(JSON.stringify(object));
    for (const key in partialObject) {
      if (key === 'limit' || key === 'offset') continue;
      delete partialObject[key];
    }

    return {
      data: await this.plainToDto(dataObject, type),
      partial: await this.plainToDto(partialObject, AbstractPartialDto),
    };
  }

}
