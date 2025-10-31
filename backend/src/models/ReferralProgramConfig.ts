import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './Organization';

@Entity('referral_program_configs')
export class ReferralProgramConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id' })
  orgId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ name: 'reseller_commission_rate', type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  resellerCommissionRate!: number;

  @Column({ name: 'lead_referral_commission_rate', type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  leadReferralCommissionRate!: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated!: Date;

  @Column({ name: 'updated_by' })
  updatedBy!: string;
}
