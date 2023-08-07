import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import LoggerModule, { RequestLoggerMiddleware } from '@modules/logger';
import { WinstonLoggerModule } from '@modules/logger/winston-logger.module';
import TaskManagerModule from '@modules/task-manager';

import { dataSourceOptions } from './settings/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    LoggerModule,
    TaskManagerModule,
    WinstonLoggerModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
