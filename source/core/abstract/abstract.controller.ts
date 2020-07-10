/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BadRequestException, Body, Delete, Get, NotFoundException, NotImplementedException, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate } from 'class-validator';
import { unflatten } from 'flat';

import { AbstractIdDto, AbstractOptionsDto } from './abstract.dto';
import { AbstractControllerMethod } from './abstract.enum';
import { AbstractEntityInterceptor } from './abstract.interceptor';
import { AbstractControllerOptions, AbstractPartialResponse } from './abstract.interface';
import { AbstractProvider } from './abstract.provider';
import { AbstractService } from './abstract.service';

/**
 * Implements a very simples CRUD controller that
 * can be extended to prevent duplicate code
 */
@UseInterceptors(AbstractEntityInterceptor)
export abstract class AbstractController<Entity> extends AbstractProvider {
  protected MISSING_DTO: string = 'missing dto implementation';
  protected MISSING_BODY: string = 'missing request body';
  protected OPERATOR_NOT_ALLOWED: string = 'filter operator is not recognized';
  protected OPERATOR_TOO_MANY: string = 'has too many filter operators';

  /** */
  public constructor(
    public readonly service: AbstractService<Entity>,
    protected options: AbstractControllerOptions = { },
  ) {
    super();
    if (!this.options.dto) this.options.dto = { };
    if (!this.options.routes) this.options.routes = { };
  }

  /**
   * Read all entitties that matches desired criterias
   * If pagination properties are present (limit & offset),
   * returns withing an encapsulated object containing total
   * @param query
   */
  @Get()
  public async get(@Query() query: Entity & AbstractOptionsDto): Promise<Entity[] | AbstractPartialResponse<Entity>> {
    await this.validateImplementation(AbstractControllerMethod.GET);

    const parsedQuery = this.parseQueryOperators(query);
    const dto = await this.plainToDtoOffset(parsedQuery.stripped, this.options.dto.read);

    const { data: unflattedData } = this.splitDataOptions(parsedQuery.unflatted);
    return this.service.readAndCount(unflattedData, dto.options);
  }

  /**
   * Read a single entity by its id
   * @param params
   */
  @Get(':id')
  public async getById(@Param() params: AbstractIdDto): Promise<Entity> {
    await this.validateImplementation(AbstractControllerMethod.GET_BY_ID);
    return this.service.readById(params.id);
  }

  /**
   * Creates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Post()
  public async post(@Body() body: Entity): Promise<Entity> {
    await this.validateImplementation(AbstractControllerMethod.POST);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.create);
    return this.service.create(dto);
  }

  /**
   * Creates or updates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Put()
  public async put(@Body() body: Entity): Promise<Entity> {
    await this.validateImplementation(AbstractControllerMethod.PUT);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.create);
    return this.service.upsert(dto);
  }

  /**
   * Updates a single entity validating its data
   * across provided create DTO
   * @param body
   */
  @Put(':id')
  public async putById(@Param() params: AbstractIdDto, @Body() body: Entity): Promise<Entity> {
    await this.validateImplementation(AbstractControllerMethod.PUT_BY_ID);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.update);
    return this.service.updateById(params.id, dto);
  }

  /**
   * Deletes a single entity by its id
   * @param body
   */
  @Delete(':id')
  public async deleteById(@Param() params: AbstractIdDto): Promise<Entity> {
    await this.validateImplementation(AbstractControllerMethod.DELETE_BY_ID);
    return this.service.deleteById(params.id);
  }

  /**
   * Validates if a given method is allowed to procede
   * @param method
   */
  public async validateImplementation(method: AbstractControllerMethod): Promise<void> {

    if (
      this.options.routes.exclude && this.options.routes.exclude.includes(method)
      || this.options.routes.only && !this.options.routes.only.includes(method)
    ) {
      throw new NotFoundException(`Cannot ${method.split('By')[0].toUpperCase()} to path`);
    }

    if (
      method === AbstractControllerMethod.GET && !this.options.dto.read
      || method === AbstractControllerMethod.POST && !this.options.dto.create
      || method === AbstractControllerMethod.PUT && !this.options.dto.create
      || method === AbstractControllerMethod.PUT_BY_ID && !this.options.dto.update
    ) {
      throw new NotImplementedException(this.MISSING_DTO);
    }
  }

  /**
   * Transforms an object into desired type, returns the typed
   * object or throws an exception with array of constraints
   * @param object
   * @param type
   */
  protected async plainToDto(object: unknown, type: ClassType<unknown>): Promise<any> { // eslint-disable-line

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
  protected async plainToDtoOffset(object: any = { }, type: ClassType<unknown>): Promise<{ data: any, options: any }> { // eslint-disable-line

    const { data, options } = this.splitDataOptions(object);

    return {
      data: await this.plainToDto(data, type),
      options: await this.plainToDto(options, AbstractOptionsDto),
    };
  }

  /**
   * Given any object, remove properties related
   * to query find options
   * @param object
   */
  protected splitDataOptions(object: any = { }): { data: any, options: any} {
    const optionKeys = [ 'limit', 'offset', 'order' ];

    const data = { ...object };
    for (const key of optionKeys) {
      delete data[key];
    }

    const options = { ...object };
    for (const key in options) {
      if (!optionKeys.includes(key)) {
        delete options[key];
      }
    }

    return { data, options };
  }

  /**
   * Parses inbound query string that may include operators:
   * $gt, $gte, $lt, $lte, $like, etc..
   * And returns several versions of it for dto validation
   * and ORM find execution
   * @param query
   */
  protected parseQueryOperators(query: any = { }): { source: any, stripped: any, unflatted: any } {
    const allowedOperators = [ 'eq', 'gt', 'gte', 'lt', 'lte', 'ne', 'like', 're' ];

    const source = { ...query };
    const stripped = { ...query };
    const unflatted = { ...query };

    for (const key in source) {
      const operatorValidation = key.split('$');

      if (operatorValidation.length <= 1) {
        continue;
      }
      else if (operatorValidation.length > 2) {
        throw new BadRequestException(`${key} ${this.OPERATOR_TOO_MANY}`);
      }
      else if (!allowedOperators.includes(operatorValidation[1])) {
        throw new BadRequestException(`${operatorValidation[1]} ${this.OPERATOR_NOT_ALLOWED}`);
      }

      stripped[key.split('$')[0].replace(/\.+$/, '')] = stripped[key];
      delete stripped[key];

      const normalizedKey = key.replace(/\.+\$/, '$').replace('$', '.$');
      unflatted[normalizedKey] = unflatted[key];
      if (key !== normalizedKey) delete unflatted[key];
    }

    return {
      source,
      stripped: unflatten(stripped),
      unflatted: unflatten(unflatted),
    };
  }

}
