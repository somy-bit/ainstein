import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Comment as CommentInterface } from '../types';
import { Post } from './Post';

@Entity('comments')
export class Comment extends BaseEntity implements CommentInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id' })
  authorId!: string;

  @Column({ name: 'author_name' })
  authorName!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'timestamp with time zone' })
  timestamp!: Date;

  @Column({ name: 'post_id' })
  postId!: string;

  // Relationships
  @ManyToOne(() => Post, (post:Post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post!: Post;
}