import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, BaseEntity } from 'typeorm';
import { SubscriptionPlan as SubscriptionPlanInterface } from '../types';
import { Organization } from './Organization';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity implements SubscriptionPlanInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', unique: true })
  orgId!: string; // FK to Organization

  @Column({ name: 'plan_name' })
  planName!: 'Free Trial' | 'Esencial' | 'Profesional';

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price!: number;

  @Column({ name: 'billing_cycle' })
  billingCycle!: 'Monthly' | 'Annual';

  @Column()
  status!: 'Active' | 'Pending Payment' | 'Cancelled' | 'Trial' | 'Expired';

  @Column({ type: 'timestamp with time zone', name: 'renewal_date' })
  renewalDate!: Date;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;

  // Complex objects stored as JSONB for flexible schema evolution
  @Column({ type: 'jsonb' })
  features!: SubscriptionPlanInterface['features'];

  @Column({ type: 'jsonb' })
  usage!: SubscriptionPlanInterface['usage'];

  @Column({ type: 'jsonb', name: 'overage_costs' })
  overageCosts!: SubscriptionPlanInterface['overageCosts'];

  @Column({ type: 'jsonb', name: 'payment_method' })
  paymentMethod!: SubscriptionPlanInterface['paymentMethod'];

  @Column({ type: 'timestamp with time zone', name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'timestamp with time zone', name: 'ends_at', nullable: true })
  endsAt?: Date;

  // Pending plan change fields
  @Column({ name: 'pending_plan_id', nullable: true })
  pendingPlanId?: string;

  @Column({ name: 'pending_plan_name', nullable: true })
  pendingPlanName?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'pending_plan_price', nullable: true })
  pendingPlanPrice?: number;

  @Column({ type: 'timestamp with time zone', name: 'plan_change_effective_date', nullable: true })
  planChangeEffectiveDate?: Date;

  // Relationships
  @OneToOne(() => Organization, organization => organization.subscriptionId)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;
}