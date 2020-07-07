import { PrimaryKey } from 'mikro-orm';
import { v4 } from 'uuid';

export abstract class AbstractIdEntity {

  @PrimaryKey()
  public id: string = v4();

}
