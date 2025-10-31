import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Lead as LeadInterface, ReferralType } from '../types';
import { Partner } from './Partner';

@Entity('leads')
export class Lead extends BaseEntity implements LeadInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lead_name' })
  leadName!: string;

  @Column({ nullable: true, name: 'partner_id' })
  partnerId?: string;

  @Column({ nullable: true, name: 'partner_name' })
  partnerName?: string;

  @Column()
  status!: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';

  @Column({ type: 'timestamp with time zone', name: 'created_date' })
  createdDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value!: number;

  @Column({ type: 'enum', enum: ReferralType, nullable: true, name: 'referral_type' })
  referralType?: ReferralType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'commission_rate_applied' })
  commissionRateApplied?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'commission_amount' })
  commissionAmount?: number;

  @Column({ nullable: true, name: 'commission_status' })
  commissionStatus?: 'PendingClientPayment' | 'Earned' | 'Paid' | 'Cancelled';

  @Column({ name: 'organization_id' })
  organizationId!: string;

  // Relationships
  @ManyToOne(() => Partner, ( partner :Partner) => partner.leads, { nullable: true })
  @JoinColumn({ name: 'partner_id' })
  partner?: Partner;
}