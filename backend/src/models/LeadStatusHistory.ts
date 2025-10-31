import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Lead } from './Lead';

@Entity('lead_status_history')
export class LeadStatusHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lead_id' })
  leadId!: string;

  @Column({ name: 'old_status', nullable: true })
  oldStatus?: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';

  @Column({ name: 'new_status' })
  newStatus!: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';

  @Column({ name: 'changed_by', nullable: true })
  changedBy?: string;

  @Column({ type: 'timestamp with time zone', name: 'changed_at', default: () => 'CURRENT_TIMESTAMP' })
  changedAt!: Date;

  @ManyToOne(() => Lead, lead => lead.id)
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;
}
