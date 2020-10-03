import { Dictionary, PoolConfig } from '@mikro-orm/core';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrmConfig {

  /* Environment Variables */
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly ORM_PORT: number;

  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @IsString()
  public readonly ORM_PASSWORD: string;

  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

  /* Service Settings */
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
