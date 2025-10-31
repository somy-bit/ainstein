import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { MarketingEvent as MarketingEventInterface, Language } from '../types';
import { Organization } from './Organization';

@Entity('marketing_events')
export class MarketingEvent extends BaseEntity implements MarketingEventInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'timestamp with time zone' })
  date!: Date;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: Language })
  language!: Language;

  @Column()
  type!: 'Webinar' | 'Workshop' | 'Conference' | 'Community Meetup';

  @Column({ nullable: true, name: 'is_community_event' })
  isCommunityEvent?: boolean;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  // Relationships
  @ManyToOne(() => Organization, organization => organization.marketingEvents)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
