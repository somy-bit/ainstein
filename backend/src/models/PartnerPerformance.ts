import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Partner } from './Partner';

@Entity('partner_performance')
export class PartnerPerformance extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'partner_id' })
  partnerId!: string;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ name: 'leads_assigned', type: 'int', default: 0 })
  leadsAssigned!: number;

  @Column({ name: 'leads_contacted', type: 'int', default: 0 })
  leadsContacted!: number;

  @Column({ name: 'leads_qualified', type: 'int', default: 0 })
  leadsQualified!: number;

  @Column({ name: 'leads_converted', type: 'int', default: 0 })
  leadsConverted!: number;

  @Column({ name: 'leads_lost', type: 'int', default: 0 })
  leadsLost!: number;

  @Column({ name: 'leads_stalled', type: 'int', default: 0 })
  leadsStalled!: number;

  @Column({ type: 'timestamp with time zone', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @ManyToOne(() => Partner, partner => partner.id)
  @JoinColumn({ name: 'partner_id' })
  partner!: Partner;
}
