import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class OrmSettings {

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

  public readonly ORM_POOL_MIN: number = 5;

  public readonly ORM_POOL_MAX: number = 25;

}
