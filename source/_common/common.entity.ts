import { Column, CreateDateColumn, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class CommonEntity {

  @PrimaryGeneratedColumn()
  public _id: number;

  @Generated('uuid')
  @Column({ type: 'varchar', length: 36, unique: true })
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  public created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updated: Date;

}
