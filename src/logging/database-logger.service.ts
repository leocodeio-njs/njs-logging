import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { ILogEntry } from './interfaces/log-entry.interface';

@Injectable()
export class DatabaseLoggerService {
  constructor(
    @InjectRepository(LogEntry)
    private readonly logRepository: Repository<LogEntry>,
  ) {}

  async saveLog(logEntry: ILogEntry): Promise<void> {
    try {
      const log = this.logRepository.create({
        ...logEntry,
        createdAt: new Date(logEntry.timestamp),
      });

      await this.logRepository.save(log);
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }
} 