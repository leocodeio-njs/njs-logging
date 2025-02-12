// utils/logging/logging.module.ts
import { DynamicModule, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigModule } from '@nestjs/config';
import { DebugUtil } from './debug.util';
import { CorrelationService } from './correlation.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { DatabaseLoggerService } from './database-logger.service';
import { LogEntry } from './entities/log-entry.entity';
import { LoggingModuleOptions } from './interfaces/logging-options.interface';

@Module({
  imports: [ConfigModule],
  providers: [CorrelationService],
  exports: [CorrelationService]
})
export class LoggingModule implements NestModule {
  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const winstonTransports = [];

    // Configure Winston transports based on options
    if (options.winston?.console !== false) {
      winstonTransports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, correlationId, ...meta }) => {
                return `[${timestamp}] ${level}: [${correlationId}] ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
              },
            ),
          ),
        }),
      );
    }

    if (options.winston?.file?.enabled) {
      // Error logs
      winstonTransports.push(
        new winston.transports.DailyRotateFile({
          filename: options.winston.file.errorPath || 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: options.winston.file.maxSize || '20m',
          maxFiles: options.winston.file.maxFiles || '14d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        })
      );

      // Combined logs
      winstonTransports.push(
        new winston.transports.DailyRotateFile({
          filename: options.winston.file.combinedPath || 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: options.winston.file.maxSize || '20m',
          maxFiles: options.winston.file.maxFiles || '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        })
      );
    }

    return {
      global: true,
      module: LoggingModule,
      imports: [
        TypeOrmModule.forFeature([LogEntry, ...(options.entities || [])]),
        WinstonModule.forRoot({
          transports: winstonTransports,
        }),
        ConfigModule,
      ],
      providers: [
        LoggerService,
        DebugUtil,
        DatabaseLoggerService,
        CorrelationMiddleware,
        CorrelationService,
      ],
      exports: [
        LoggerService,
        DebugUtil,
        DatabaseLoggerService,
        CorrelationMiddleware,
        CorrelationService,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
