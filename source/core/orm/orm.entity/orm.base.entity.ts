import { AnyEntity, BaseEntity } from '@mikro-orm/core';

export abstract class OrmBaseEntity extends BaseEntity<AnyEntity, 'id'> {

}
