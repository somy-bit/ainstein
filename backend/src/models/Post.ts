import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Post as PostInterface } from '../types';
import { Comment } from './Comment';

@Entity('posts')
export class Post extends BaseEntity implements PostInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id' })
  authorId!: string; // User or Partner ID

  @Column({ name: 'author_name' })
  authorName!: string;

  @Column({ nullable: true, name: 'author_logo_url' })
  authorLogoUrl?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'timestamp with time zone' })
  timestamp!: Date;

  @Column({ default: 0 })
  likes!: number;

  // Relationships
  @OneToMany(() => Comment, comment => comment.post)
  comments!: Comment[];
}