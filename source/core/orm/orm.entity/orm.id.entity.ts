import { AnyEntity, BaseEntity, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

export abstract class OrmIdEntity extends BaseEntity<AnyEntity, 'id'> {

  @PrimaryKey()
  public id: string = v4();

}
