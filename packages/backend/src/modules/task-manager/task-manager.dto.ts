import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TaskEntity, TeamType } from 'src/entities/task.entity';

/** ------- INPUT REQUEST ------ */
export class AddTaskDto {
  @ApiProperty({ type: String, enum: TeamType, enumName: 'TeamType' })
  @IsEnum(TeamType)
  team: TeamType;

  @ApiProperty({ type: String })
  @IsString()
  description: string;
}

export class UpdateTaskDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String, enum: TeamType, enumName: 'TeamType' })
  @IsEnum(TeamType)
  @IsOptional()
  team?: TeamType;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
}

export class TestTaskDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ type: String, enum: TeamType, enumName: 'TeamType' })
  @IsEnum(TeamType)
  @IsOptional()
  team?: TeamType;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
}

/** ------- RESPONSE --------- */
export class TasksResponseDto {
  @ApiProperty({ type: Number })
  totalCount: number;

  @ApiProperty({ type: [TaskEntity] })
  data: TaskEntity[];
}
