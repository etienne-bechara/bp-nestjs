import { Entity, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity({ tableName: 'app_metadata' })
export abstract class AbstractEntity {

  @PrimaryKey()
  public id: string = v4();

  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}
