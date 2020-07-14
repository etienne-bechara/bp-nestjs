import { Index, Property } from 'mikro-orm';

import { OrmIdEntity } from '.';

export abstract class OrmTimestampEntity extends OrmIdEntity {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}
