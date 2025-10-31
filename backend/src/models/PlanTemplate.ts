import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('plan_templates')
export class PlanTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price!: number;

  @Column({ name: 'billing_cycle' })
  billingCycle!: 'Monthly' | 'Annual';

  @Column({ name: 'trial_days', default: 0 })
  trialDays!: number;

  @Column({ name: 'stripe_price_id', nullable: true })
  stripePriceId?: string;

  @Column({ type: 'jsonb' })
  features!: {
    partnerManagers: { limit: number };
    admins: { limit: number };
    partners: { limit: number };
    textTokens: { limit: number };
    speechToTextMinutes: { limit: number };
    storageGB: { limit: number };
  };

  @Column({ type: 'jsonb', name: 'overage_costs' })
  overageCosts!: {
    additionalPartner: number;
    textTokensPer1k: number;
    speechToTextPerMinute: number;
    storagePerGB: number;
  };

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'timestamp with time zone', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
