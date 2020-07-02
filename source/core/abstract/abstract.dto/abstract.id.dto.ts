import { IsUUID } from 'class-validator';
import { FilterQuery } from 'mikro-orm';

export class AbstractIdDto<Entity> {

  @IsUUID()
  public id: FilterQuery<Entity>;

}
