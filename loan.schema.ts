import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LoanStatus } from './loan.model';

@Entity('loans')
export class LoanSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column()
  memberName: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  tenure: number;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING_STAFF_APPROVAL
  })
  status: LoanStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  approver_level_1_id?: number;

  @Column({ nullable: true })
  approver_level_2_id?: number;

  @Column({ nullable: true })
  approver_level_3_id?: number;

  @Column({ nullable: true })
  approver_level_4_id?: number;

  @Column({ nullable: true })
  rejectionReason?: string;
}