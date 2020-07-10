import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

export class AbstractOptionsDto {

  @IsOptional()
  @Transform((v) => parseInt(v))
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @Transform((v) => parseInt(v))
  @IsNumber() @Min(0)
  public offset?: number;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9_]+:(asc|desc)$/)
  public order?: string;

}
