import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TaskEntity } from 'src/entities/task.entity';

import { AddTaskDto, TestTaskDto, UpdateTaskDto } from './task-manager.dto';
import { TaskManagerService } from './task-manager.service';

@ApiTags('task-manager')
@Controller('task-manager')
export class TaskManagerController {
  constructor(private readonly taskManagerSrv: TaskManagerService) {}

  @Get('/tasks')
  async getAllTasks() {
    return this.taskManagerSrv.getAllTasks();
  }

  @Post('/create')
  async createTask(@Body() body: AddTaskDto): Promise<TaskEntity> {
    return this.taskManagerSrv.createTask(body);
  }

  @Put('/update')
  async updateTask(@Body() body: UpdateTaskDto): Promise<void> {
    return this.taskManagerSrv.updateTask(body);
  }

  @Delete('/delete/:id')
  async deleteTask(@Param('id') id: number) {
    return this.taskManagerSrv.deleteTask(id);
  }

  @Post('/test')
  async test(@Body() body: TestTaskDto) {
    return this.taskManagerSrv.test(body);
  }
}
