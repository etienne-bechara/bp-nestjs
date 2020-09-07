import { Entity } from '@mikro-orm/core';

import { OrmTimestampEntity } from '../core/orm/orm.entity';

@Entity({ tableName: '_Snake_' })
export class _Pascal_Entity extends OrmTimestampEntity {

}
