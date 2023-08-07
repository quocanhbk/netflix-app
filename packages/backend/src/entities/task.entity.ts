import { IsEnum, IsNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TeamType {
  Blockchain = 'Blockchain',
  QA = 'QA',
  Game = 'Game',
  Design = 'Design',
}

@Entity()
export class TaskEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn('increment')
  @IsNumber()
  id: number;

  @ApiProperty({ type: String, enum: TeamType, enumName: 'TeamType' })
  @Column({ type: String })
  @IsEnum(TeamType)
  team: TeamType;

  @ApiProperty({ type: String })
  @Column({ type: String })
  @IsString()
  description: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt?: Date;
}
