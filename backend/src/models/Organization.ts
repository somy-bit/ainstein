import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, BaseEntity } from 'typeorm';
import { Organization as OrganizationInterface } from '../types';
import { User } from './User';
import { Partner } from './Partner';
import { SubscriptionPlan } from './SubscriptionPlan';
import { MarketingEvent } from './MarketingEvent';
import { KnowledgeFile } from './KnowledgeFile';

@Entity('organizations')
export class Organization extends BaseEntity implements OrganizationInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  // Foreign Key to SubscriptionPlan
  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId?: string;

  @Column({ nullable: true, name: 'company_id' })
  companyId?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  province?: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  // Relationships
  @OneToMany(() => User, user => user.organization)
  users!: User[];

  @OneToMany(() => Partner, (partner:Partner) => partner.organization)
  partners!: Partner[];

  @OneToMany(() => MarketingEvent, (event: MarketingEvent) => event.organization)
  marketingEvents!: MarketingEvent[];

  @OneToMany(() => KnowledgeFile, (file: KnowledgeFile) => file.organization)
  knowledgeFiles!: KnowledgeFile[];

  // One-to-One to SubscriptionPlan (referenced by subscriptionId)
  // This relationship is often better modeled explicitly in the SubscriptionPlan entity
}