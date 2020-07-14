import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class OrmReadDto {

  @IsOptional()
  @IsUUID()
  public id: string;

  @IsOptional()
  @IsISO8601()
  public created: string;

  @IsOptional()
  @IsISO8601()
  public updated: string;

}
