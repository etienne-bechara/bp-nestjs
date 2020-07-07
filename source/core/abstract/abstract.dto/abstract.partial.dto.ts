/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Transform } from 'class-transformer';
import { IsNumber, Min, ValidateIf } from 'class-validator';

export class AbstractPartialDto {

  @ValidateIf((o) => o.page)
  @Transform((v) => parseInt(v))
  @IsNumber()
  @Min(1)
  public limit?: number;

  @ValidateIf((o) => o.limit)
  @Transform((v) => parseInt(v))
  @IsNumber()
  @Min(0)
  public offset?: number;

}
