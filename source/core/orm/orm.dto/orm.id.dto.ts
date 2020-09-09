import { IsNotEmpty } from 'class-validator';

export class OrmIdDto {

  @IsNotEmpty()
  public id: string;

}
