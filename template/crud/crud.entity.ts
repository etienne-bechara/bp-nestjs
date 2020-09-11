import { Entity } from '@mikro-orm/core';

import { OrmUuidEntity } from '../core/orm/orm.entity';

@Entity({ tableName: 'snake_case' })
export class PascalCaseEntity extends OrmUuidEntity {

}
