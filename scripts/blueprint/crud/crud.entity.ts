import { Entity } from 'mikro-orm';

import { AbstractTimestampEntity } from '../core/abstract/abstract.entity';

@Entity({ tableName: '__SnakeCaseName__' })
export class __PascalCaseName__Entity extends AbstractTimestampEntity {

}
