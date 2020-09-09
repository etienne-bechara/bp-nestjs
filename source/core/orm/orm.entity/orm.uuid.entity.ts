import { PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmUuidEntity extends OrmTimestampEntity {

  @PrimaryKey({ length: 36 })
  public id: string = v4();

}
