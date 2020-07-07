import { Index, Property } from 'mikro-orm';

import { AbstractIdEntity } from '.';

export abstract class AbstractTimestampEntity extends AbstractIdEntity {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}
