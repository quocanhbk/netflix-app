import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  InvalidTeamException,
  NotFoundTaskException,
} from '@core/exceptions/task';
import { TaskEntity, TeamType } from 'src/entities/task.entity';

import {
  AddTaskDto,
  TasksResponseDto,
  TestTaskDto,
  UpdateTaskDto,
} from './task-manager.dto';

@Injectable()
export class TaskManagerService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
  ) {}

  async getAllTasks(): Promise<TasksResponseDto> {
    const tasks = await this.taskRepo.find();

    return {
      totalCount: tasks.length,
      data: tasks,
    };
  }

  async createTask(input: AddTaskDto) {
    return this.taskRepo.save({
      team: input.team,
      description: input.description,
    });
  }

  async updateTask(input: UpdateTaskDto) {
    const task = await this.taskRepo.findOneBy({ id: input.id });

    if (!task) {
      throw new NotFoundTaskException();
    }

    if (input.team && !Object.values(TeamType).includes(input.team)) {
      throw new InvalidTeamException();
    }

    await this.taskRepo
      .createQueryBuilder('task')
      .update(TaskEntity)
      .when(input.team, (query) => query.set({ team: input.team }))
      .when(input.description, (query) =>
        query.set({ description: input.description }),
      )
      .where('id = :id', { id: input.id })
      .execute();
  }

  async deleteTask(id: number) {
    const task = await this.taskRepo.findOneBy({ id });

    if (!task) {
      throw new NotFoundTaskException();
    }

    return this.taskRepo.delete({ id });
  }

  async test(input: TestTaskDto) {
    throw new BadRequestException('error');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(TaskEntity, input.id, {
        description: input.description,
      });

      await this.taskRepo
        .createQueryBuilder('task', queryRunner)
        .update(TaskEntity)
        .set({ team: input.team })
        .where('id = :id', { id: input.id })
        .execute();

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
