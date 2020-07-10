/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class AbstractPartialDto {

  @IsOptional()
  @Transform((v) => parseInt(v))
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @Transform((v) => parseInt(v))
  @IsNumber() @Min(0)
  public offset?: number;

}
