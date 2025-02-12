import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './logging/logging.module';
import { LogEntry } from './logging/entities/log-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, AppConfigService } from '@leocodeio-njs/njs-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogEntry,
    ]),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [
          __dirname + '/**/*.entity{.ts,.js}',
          LogEntry,
        ],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    LoggingModule.forRoot({
      entities: [
        LogEntry,
      ],
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
