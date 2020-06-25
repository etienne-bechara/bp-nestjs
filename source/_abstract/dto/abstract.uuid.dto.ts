import { IsUUID } from 'class-validator';

export class AbstractUuidDto {

  @IsUUID()
  public id: string;

}
