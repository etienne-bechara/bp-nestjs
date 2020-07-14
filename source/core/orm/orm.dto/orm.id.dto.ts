import { IsUUID } from 'class-validator';

export class OrmIdDto {

  @IsUUID()
  public id: string;

}
