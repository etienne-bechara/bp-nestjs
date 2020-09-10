import { Entity } from '@mikro-orm/core';

import { OrmUuidEntity } from '../core/orm/orm.entity';

@Entity({ tableName: '_Snake_' })
export class _Pascal_Entity extends OrmUuidEntity {

}
