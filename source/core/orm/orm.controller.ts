import { BadRequestException, Body, Delete, Get, NotFoundException,
  NotImplementedException, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate } from 'class-validator';
import { unflatten } from 'flat';

import { OrmFilterDto, OrmIdDto } from './orm.dto';
import { OrmControllerMethod } from './orm.enum';
import { OrmEntityInterceptor } from './orm.interceptor';
import { OrmControllerOptions, OrmPartialResponse } from './orm.interface';
import { OrmService } from './orm.service';

/**
 * Implements a very simples CRUD controller that
 * can be extended to prevent duplicate code.
 */
@UseInterceptors(OrmEntityInterceptor)
export abstract class OrmController<Entity> {
  protected readonly MISSING_DTO: string = 'missing dto implementation';
  protected readonly MISSING_BODY: string = 'missing request body';
  protected readonly OPERATOR_NOT_ALLOWED: string = 'filter operator is not recognized';
  protected readonly OPERATOR_TOO_MANY: string = 'has too many filter operators';

  public constructor(
    public readonly service: OrmService<Entity>,
    protected options: OrmControllerOptions = { },
  ) {
    if (!this.options.dto) this.options.dto = { };
    if (!this.options.routes) this.options.routes = { };
  }

  /**
   * Read all entities that matches desired criteria
   * If pagination properties are present (limit & offset),
   * returns withing an encapsulated object containing total.
   * @param query
   */
  @Get()
  public async get(@Query() query: Entity & OrmFilterDto): Promise<Entity[] | OrmPartialResponse<Entity>> {
    this.validateImplementation(OrmControllerMethod.GET);

    const parsedQuery = this.parseQueryOperators(query);
    const dto = await this.plainToDtoOffset(parsedQuery.stripped, this.options.dto.read);

    const { data: unflattedData } = this.splitDataOptions(parsedQuery.unflatted);
    return this.service.readAndCount(unflattedData, dto.options);
  }

  /**
   * Read a single entity by its id.
   * @param params
   */
  @Get(':id')
  public async getById(@Param() params: OrmIdDto): Promise<Entity> {
    this.validateImplementation(OrmControllerMethod.GET_BY_ID);
    return this.service.readById(params.id);
  }

  /**
   * Creates a single entity validating its data
   * across provided create DTO.
   * @param body
   */
  @Post()
  public async post(@Body() body: Entity): Promise<Entity> {
    this.validateImplementation(OrmControllerMethod.POST);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.create);
    return this.service.create(dto);
  }

  /**
   * Creates or updates a single entity validating its data
   * across provided create DTO.
   * @param body
   */
  @Put()
  public async put(@Body() body: Entity): Promise<Entity> {
    this.validateImplementation(OrmControllerMethod.PUT);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.create);
    return this.service.upsert(dto);
  }

  /**
   * Updates a single entity validating its data
   * across provided create DTO.
   * @param params
   * @param body
   */
  @Put(':id')
  public async putById(@Param() params: OrmIdDto, @Body() body: Entity): Promise<Entity> {
    this.validateImplementation(OrmControllerMethod.PUT_BY_ID);
    if (!body) throw new BadRequestException(this.MISSING_BODY);

    const dto = await this.plainToDto(body, this.options.dto.update);
    return this.service.updateById(params.id, dto);
  }

  /**
   * Deletes a single entity by its id.
   * @param params
   */
  @Delete(':id')
  public async deleteById(@Param() params: OrmIdDto): Promise<Entity> {
    this.validateImplementation(OrmControllerMethod.DELETE_BY_ID);
    return this.service.deleteById(params.id);
  }

  /**
   * Validates if a given method is allowed to proceed.
   * @param method
   */
  public validateImplementation(method: OrmControllerMethod): void {

    if (
      this.options.routes.exclude?.includes(method)
      || this.options.routes.only && !this.options.routes.only.includes(method)
    ) {
      throw new NotFoundException(`Cannot ${method.split('By')[0].toUpperCase()} to path`);
    }

    if (
      method === OrmControllerMethod.GET && !this.options.dto.read
      || method === OrmControllerMethod.POST && !this.options.dto.create
      || method === OrmControllerMethod.PUT && !this.options.dto.create
      || method === OrmControllerMethod.PUT_BY_ID && !this.options.dto.update
    ) {
      throw new NotImplementedException(this.MISSING_DTO);
    }
  }

  /**
   * Transforms an object into desired type, returns the typed
   * object or throws an exception with array of constraints.
   * @param object
   * @param type
   */
  protected async plainToDto(object: unknown, type: ClassType<unknown>): Promise<any> {

    const typedObject = plainToClass(type, object);
    const failedConstraints = await validate(typedObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
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
   * types, if validation fails, throws an exception with array of constraints.
   * @param object
   * @param type
   */
  protected async plainToDtoOffset(object: any = { }, type: ClassType<unknown>): Promise<{ data: any; options: any }> {

    const { data, options } = this.splitDataOptions(object);

    return {
      data: await this.plainToDto(data, type),
      options: await this.plainToDto(options, OrmFilterDto),
    };
  }

  /**
   * Given any object, remove properties related
   * to query find options.
   * @param object
   */
  protected splitDataOptions(object: any = { }): { data: any; options: any} {
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
   * and ORM find execution.
   * @param query
   */
  protected parseQueryOperators(query: any = { }): { source: any; stripped: any; unflatted: any } {
    const allowedOperators = new Set([ 'eq', 'gt', 'gte', 'lt', 'lte', 'ne', 'like', 're' ]);

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
      else if (!allowedOperators.has(operatorValidation[1])) {
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
