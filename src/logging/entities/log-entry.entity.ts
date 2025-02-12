import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class LogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column()
  correlationId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: string;

  @Column({ type: 'jsonb', nullable: true })
  context: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'jsonb', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
} 