import { Module } from '@nestjs/common';
import { TaskCommentsService } from './task-comments.service';
import { TaskCommentsController } from './task-comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskComment, TaskCommentSchema } from './schemas/task-comment.schema';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: TaskComment.name, schema: TaskCommentSchema }]), TasksModule],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsService],
})
export class TaskCommentsModule {}
