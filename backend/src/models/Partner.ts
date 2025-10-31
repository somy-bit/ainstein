import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BaseEntity } from 'typeorm';
import { Partner as PartnerInterface, PartnerCategory, ISVPartnerType } from '../types';
import { Organization } from './Organization';
import { User } from './User';
import { Lead } from './Lead';
import { PartnerPerformanceService } from '../services/partnerPerformance.service';

@Entity('partners')
export class Partner extends BaseEntity implements PartnerInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  tier!: string;

  @Column()
  specialization!: string;

  @Column()
  region!: string;

  @Column({ name: 'performance_score' })
  performanceScore!: number;

  @Column({ name: 'contact_email' })
  contactEmail!: string;

  @Column({ type: 'enum', enum: PartnerCategory })
  category!: PartnerCategory;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @Column({ name: 'organization_name' })
  organizationName!: string;

  @Column({ type: 'enum', enum: ISVPartnerType, nullable: true, name: 'isv_type' })
  isvType?: ISVPartnerType;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true, name: 'logo_url' })
  logoUrl?: string;

  @Column({ nullable: true })
  description?: string;

  // Denormalized array fields using JSONB
  @Column({ type: 'jsonb', nullable: true })
  connections?: string[]; // Array of partner IDs

  @Column({ type: 'jsonb', nullable: true })
  badges?: string[];

  // Relationships
  @ManyToOne(() => Organization, organization => organization.partners)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @OneToMany(() => User, user => user.partner)
  users!: User[];

  @OneToMany(() => Lead, lead => lead.partner)
  leads!: Lead[];

  // Method to get dynamic performance score as percentage
  async getDynamicPerformanceScore(): Promise<number> {
    return await PartnerPerformanceService.calculatePerformanceScore(this.id);
  }
}