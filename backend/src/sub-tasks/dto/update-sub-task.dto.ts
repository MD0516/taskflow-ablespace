import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { CreateSubTaskDto } from './create-sub-task.dto';

export class UpdateSubTaskDto extends PartialType(CreateSubTaskDto) {
  @IsMongoId()
  _id!: string;
}

export class UpdateBulkSubTaskDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubTaskDto)
  subTasks!: UpdateSubTaskDto[];
}
