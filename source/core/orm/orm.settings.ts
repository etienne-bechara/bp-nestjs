import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class OrmSettings {

  /* Environment Variables */

  @IsOptional()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_HOST: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public ORM_PORT: number;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_USERNAME: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString()
  public ORM_PASSWORD: string;

  @ValidateIf((o) => !!o.ORM_TYPE)
  @IsString() @IsNotEmpty()
  public ORM_DATABASE: string;

  /* Provider Options */

  public ORM_POOL_MIN: number = 5;

  public ORM_POOL_MAX: number = 25;

}
