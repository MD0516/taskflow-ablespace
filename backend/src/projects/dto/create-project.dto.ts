import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsString } from 'class-validator';
import { Priority } from 'common/enums';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(Priority)
  priority!: Priority;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsBoolean()
  isPrivate!: boolean;
}
