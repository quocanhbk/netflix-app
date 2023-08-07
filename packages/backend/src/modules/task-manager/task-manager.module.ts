import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskEntity } from 'src/entities/task.entity';

import { TaskManagerController } from './task-manager.controller';
import { TaskManagerService } from './task-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  controllers: [TaskManagerController],
  providers: [TaskManagerService],
  exports: [TaskManagerService],
})
export class TaskManagerModule {}
