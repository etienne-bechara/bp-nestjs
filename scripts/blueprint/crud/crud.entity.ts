import { Entity } from 'mikro-orm';

import { OrmTimestampEntity } from '../core/orm/orm.entity';

@Entity({ tableName: '__SnakeCaseName__' })
export class __PascalCaseName__Entity extends OrmTimestampEntity {

}
