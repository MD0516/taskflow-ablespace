import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TaskComment, TaskCommentDocument } from './schemas/task-comment.schema';
import { Model } from 'mongoose';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectModel(TaskComment.name)
    private taskCommentModel: Model<TaskCommentDocument>,
    private taskService: TasksService,
  ) {}

  async create(
    taskId: string,
    userId: string,
    createTaskCommentDto: CreateTaskCommentDto,
  ): Promise<TaskCommentDocument> {
    const canComment = await this.taskService.canComment(taskId, userId);
    if (!canComment) {
      throw new ForbiddenException('You are not allowed to comment on this task');
    }

    const data = {
      taskId,
      userId,
      ...createTaskCommentDto,
    };
    return await this.taskCommentModel.create(data);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const updated = await this.taskCommentModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    return !!updated;
  }
}
