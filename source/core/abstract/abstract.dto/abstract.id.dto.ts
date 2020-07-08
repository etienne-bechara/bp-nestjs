import { IsUUID } from 'class-validator';

export class AbstractIdDto {

  @IsUUID()
  public id: string;

}
