import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

export class OrmFilterDto {

  @IsOptional()
  @Transform((v) => Number.parseInt(v))
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @Transform((v) => Number.parseInt(v))
  @IsNumber() @Min(0)
  public offset?: number;

  @IsOptional()
  @Matches(/^\w+:(asc|desc)$/)
  public order?: string;

}
