import { IsUUID } from 'class-validator';

export class AbstractIdDto<Entity> {

  @IsUUID()
  public id: string;

}
