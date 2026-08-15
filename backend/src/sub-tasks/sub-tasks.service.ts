import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBulkSubTaskDto, CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateBulkSubTaskDto } from './dto/update-sub-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SubTask, SubTaskDocument } from './schemas/sub-task.schema';
import { ClientSession, Model } from 'mongoose';
import { TasksService } from 'src/tasks/tasks.service';
import { DeleteSubTaskDto } from './dto/delete-sub-task.dto';

@Injectable()
export class SubTasksService {
  constructor(
    @InjectModel(SubTask.name)
    private subTaskModel: Model<SubTaskDocument>,
    private taskService: TasksService,
  ) {}

  async createBulk(
    taskId: string,
    createdBy: string,
    dto: CreateSubTaskDto[],
    session: ClientSession,
  ): Promise<SubTaskDocument[]> {
    const subTasks = dto.map((subTask) => ({
      ...subTask,
      taskId,
      createdBy,
    }));

    return await this.subTaskModel.insertMany(subTasks, { session });
  }

  async create(userId: string, taskId: string, createSubTaskDto: CreateBulkSubTaskDto): Promise<SubTaskDocument[]> {
    const isOwnerOrAssignee = await this.taskService.isOwnerOrAssignee(taskId, userId);

    if (!isOwnerOrAssignee) {
      throw new ForbiddenException('You are not allowed to create sub tasks');
    }
    const subTasks = createSubTaskDto.subTasks.map((subTask) => ({
      ...subTask,
      createdBy: userId,
      taskId,
    }));

    return await this.subTaskModel.insertMany(subTasks, { ordered: false });
  }

  async update(id: string, userId: string, updateSubTaskDto: UpdateBulkSubTaskDto): Promise<SubTaskDocument[]> {
    const isOwnerOrAssignee = await this.taskService.isOwnerOrAssignee(id, userId);

    if (!isOwnerOrAssignee) {
      throw new ForbiddenException('You are not allowed to create sub tasks');
    }

    await this.subTaskModel.bulkWrite(
      updateSubTaskDto.subTasks.map((subTask) => {
        const { _id, ...data } = subTask;
        return {
          updateOne: {
            filter: {
              _id,
              taskId: id,
              deletedAt: null,
            },
            update: {
              $set: Object.fromEntries(Object.entries(data).filter(([, value]) => value != undefined)),
            },
          },
        };
      }),
    );

    return await this.subTaskModel.find({
      taskId: id,
      deletedAt: null,
    });
  }

  async remove(taskId: string, userId: string, dto: DeleteSubTaskDto): Promise<{ deletedCount: number }> {
    const isOwnerOrAssignee = await this.taskService.isOwnerOrAssignee(taskId, userId);

    if (!isOwnerOrAssignee) {
      throw new ForbiddenException('You are not allowed to delete sub tasks');
    }

    const result = await this.subTaskModel.updateMany(
      {
        _id: { $in: dto.subTaskId },
        taskId,
        deletedAt: null,
      },
      {
        deletedAt: new Date(),
      },
    );

    return {
      deletedCount: result.modifiedCount,
    };
  }
}
