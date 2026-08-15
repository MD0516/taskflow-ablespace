import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Priority } from 'common/enums';

export class CreateSubTaskDto {
  @IsString()
  title!: string;

  @IsEnum(Priority)
  priority!: Priority;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignees?: string[];
}

export class CreateBulkSubTaskDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubTaskDto)
  subTasks!: CreateSubTaskDto[];
}
