import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User as UserInterface, UserRole } from '../types';
import { Organization } from './Organization';
import { Partner } from './Partner';

@Entity('users')
export class User extends BaseEntity implements UserInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  name!: string;

  @Column({ nullable: true, name: 'last_name_paternal' })
  lastNamePaternal?: string;

  @Column({ nullable: true, name: 'last_name_maternal' })
  lastNameMaternal?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ select: false, nullable: true })
  password?: string; // Store hashed password

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @Column({ nullable: true, name: 'organization_name' })
  organizationName?: string; // For convenience/denormalization

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  // Denormalized array fields using JSONB for simple array storage
  @Column({ type: 'jsonb', nullable: true })
  connections?: string[]; // Array of partner IDs

  @Column({ type: 'jsonb', nullable: true })
  badges?: string[];

  @Column({ nullable: true, name: 'partner_id' })
  partnerId?: string;

  @Column({ default: false, name: 'must_change_password' })
  mustChangePassword!: boolean;

  @Column({ default: false, name: 'mfa_enabled' })
  mfaEnabled!: boolean;

  @Column({ nullable: true, name: 'is_google_user' })
  isGoogleUser?: boolean;

  // Relationships
  @ManyToOne(() => Organization, (organization: Organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => Partner, partner => partner.users, { nullable: true })
  @JoinColumn({ name: 'partner_id' })
  partner?: Partner;
}