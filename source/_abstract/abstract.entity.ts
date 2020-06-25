import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class AbstractTimestampEntity {

  @CreateDateColumn({ type: 'timestamp' })
  public created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updated: Date;

}

export class AbstractUuidEntity extends AbstractTimestampEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

}

export class AbstractIncrementEntity extends AbstractTimestampEntity {

  @PrimaryGeneratedColumn('increment')
  public id: number;

}
