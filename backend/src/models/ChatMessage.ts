import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ChatMessage as ChatMessageInterface, Language } from '../types';

@Entity('chat_messages')
export class ChatMessage extends BaseEntity implements ChatMessageInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column()
  sender!: 'user' | 'ai';

  @Column({ type: 'timestamp with time zone' })
  timestamp!: Date;

  @Column({ type: 'enum', enum: Language })
  language!: Language;

  @Column({ nullable: true, name: 'is_diagram' })
  isDiagram?: boolean;
  
  // You would typically add a column to link this to a User or a Chat Session
  // @Column({ name: 'user_id' })
  // userId!: string; 
}