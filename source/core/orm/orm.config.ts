import { Dictionary, PoolConfig } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class OrmConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @InjectSecret()
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  public readonly ORM_PORT: number;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @InjectSecret()
  @IsString()
  public readonly ORM_PASSWORD: string;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

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
