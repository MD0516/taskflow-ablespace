import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Model } from 'mongoose';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SubTasksService } from 'src/sub-tasks/sub-tasks.service';
import { SubTaskDocument } from 'src/sub-tasks/schemas/sub-task.schema';

type CreatedTask = Task & {
  subTasks: SubTaskDocument[];
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,

    @Inject(forwardRef(() => ProjectsService))
    private projectService: ProjectsService,
    private subTaskService: SubTasksService,
  ) {}

  async getProjectIdsAssignedToUser(userId: string) {
    return this.taskModel.distinct('projectId', {
      assignees: userId,
    });
  }

  async isOwnerOrAssignee(task: TaskDocument, userId: string): Promise<boolean>;

  async isOwnerOrAssignee(taskId: string, userId: string): Promise<boolean>;

  async isOwnerOrAssignee(taskOrId: TaskDocument | string, userId: string): Promise<boolean> {
    const task = typeof taskOrId === 'string' ? await this.taskModel.findById(taskOrId) : taskOrId;

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isCreator = task.createdBy.toString() === userId;
    const isAssignee = task.assignees?.some((id) => id.toString() === userId) ?? false;

    return isCreator || isAssignee;
  }

  async canComment(taskId: string, userId: string): Promise<boolean> {
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task?.projectId == null) {
      return true;
    }

    const project = await this.projectService.findOne(task.projectId.toString(), userId);

    if (!project?.isPrivate) {
      return true;
    }

    return this.isOwnerOrAssignee(task, userId);
  }

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<CreatedTask> {
    const session = await this.taskModel.db.startSession();

    try {
      session.startTransaction();

      const { subTasks, ...taskData } = createTaskDto;

      const task = await this.taskModel.create(
        [
          {
            ...taskData,
            createdBy: userId,
          },
        ],
        { session },
      );

      let createdSubTasks: SubTaskDocument[] = [];
      if (subTasks?.length) {
        createdSubTasks = await this.subTaskService.createBulk(task[0]._id.toString(), userId, subTasks, session);
      }

      await session.commitTransaction();

      return {
        ...task[0].toObject(),
        subTasks: createdSubTasks,
      };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async findStandAloneTasks(): Promise<TaskDocument[]> {
    return await this.taskModel.find({ projectId: null, deletedAt: null });
  }

  async findOne(id: string, userId: string): Promise<TaskDocument | null> {
    const task = await this.taskModel
      .findOne({ _id: id, deletedAt: null })
      .populate({
        path: 'subTasks',
        populate: [{ path: 'user' }, { path: 'members' }],
      })
      .populate({
        path: 'comments',
        populate: [{ path: 'user' }],
      })
      .populate(['project', 'user', 'members']);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projectId != null) {
      const visibleIds = await this.projectService.getVisibleProjectIds(userId);

      if (!visibleIds.includes(task.projectId.toString())) {
        throw new ForbiddenException('You are not allowed access this task');
      }
    }

    return task;
  }

  async update(id: string, userId: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ _id: id, deletedAt: null });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwnerOrAssignee = await this.isOwnerOrAssignee(task, userId);
    if (!isOwnerOrAssignee) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    const updated = await this.taskModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateTaskDto },
      { new: true },
    );

    return updated!;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const updated = await this.taskModel.findOneAndUpdate(
      { _id: id, createdBy: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    return !!updated;
  }

  async updateStatus(id: string, userId: string, dto: UpdateTaskStatusDto): Promise<TaskDocument | null> {
    const task = await this.taskModel.findOne({ _id: id, deletedAt: null });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwnerOrAssignee = await this.isOwnerOrAssignee(task, userId);
    if (!isOwnerOrAssignee) {
      throw new ForbiddenException('You are not allowed to update this task');
    }
    const updated = await this.taskModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: dto }, { new: true });

    return updated!;
  }
}
