import { Dictionary, PoolConfig } from '@mikro-orm/core';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class OrmConfig {

  /* Environment Variables */

  @IsOptional()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly ORM_PORT: number;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString()
  public readonly ORM_PASSWORD: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

  /* Provider Options */

  public readonly ORM_POOL_CONFIG: PoolConfig = {
    min: 5,
    max: 25,
  };

  public readonly ORM_DRIVER_OPTIONS: Dictionary<any> = {
    connection: {
      enableKeepAlive: true,
      dateStrings: [
        'DATE',
        'DATETIME',
      ],
    },
  };

}
