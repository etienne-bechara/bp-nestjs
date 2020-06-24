import { Column, Entity } from 'typeorm';

import { CommonEntity } from '../_common/common.entity';

@Entity('status')
export class StatusEntity extends CommonEntity {
  //
  @Column({ type: 'varchar', length: 50 })
  public oi: string;
}
