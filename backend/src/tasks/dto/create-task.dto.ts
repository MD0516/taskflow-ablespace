import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Priority, TaskStatus } from 'common/enums';
import { CreateSubTaskDto } from 'src/sub-tasks/dto/create-sub-task.dto';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  resources?: {
    label: string;
    link: string;
  }[];

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignees?: string[];

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsArray()
  subTasks?: CreateSubTaskDto[];
}
