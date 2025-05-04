import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './logging/logging.module';
import { LogEntry } from './logging/entities/log-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, AppConfigService } from '@leocodeio-njs/njs-config';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { PrometheusService } from '@leocodeio-njs/njs-health';
import { LoggingInterceptor } from './logging/logging.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogEntry]),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [__dirname + '/**/*.entity{.ts,.js}', LogEntry],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    LoggingModule.forRoot({
      entities: [LogEntry],
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
