import { PrimaryKey } from '@mikro-orm/core';

import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmSerialIdEntity extends OrmTimestampEntity {

  @PrimaryKey()
  public id: number;

}
