import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { KnowledgeFile as KnowledgeFileInterface } from '../types';
import { Organization } from './Organization';

@Entity('knowledge_files')
export class KnowledgeFile extends BaseEntity implements KnowledgeFileInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column()
  size!: number; // in bytes

  @Column({ type: 'timestamp with time zone', name: 'upload_date' })
  uploadDate!: Date;

  @Column()
  uploader!: string; // User ID or name

  @Column({ nullable: true })
  url?: string;

  @Column({ name: 'file_path', nullable: true })
  filePath?: string; // Path to actual file on disk

  @Column({ name: 'organization_id' })
  organizationId!: string;

  // Relationships
  @ManyToOne(() => Organization, organization => organization.knowledgeFiles)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}