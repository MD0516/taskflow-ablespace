import { IsString } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  comment!: string;
}
