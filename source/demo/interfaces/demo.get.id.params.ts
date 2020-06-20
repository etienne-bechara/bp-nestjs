import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DemoGetIdParams {

  @Transform((v) => parseInt(v))
  @IsNumber({ maxDecimalPlaces: 0 })
  public id: number;

}
