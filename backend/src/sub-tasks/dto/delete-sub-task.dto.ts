import { IsArray, IsMongoId } from 'class-validator';

export class DeleteSubTaskDto {
  @IsArray()
  @IsMongoId({ each: true })
  subTaskId!: string[];
}
