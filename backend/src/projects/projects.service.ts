import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<ProjectDocument>,

    @Inject(forwardRef(() => TasksService))
    private taskService: TasksService,
  ) {}

  async getVisibleProjectIds(userId: string): Promise<string[]> {
    const memberProjectIds = await this.taskService.getProjectIdsAssignedToUser(userId);

    const projects = await this.projectModel
      .find({
        deletedAt: null,
        $or: [{ isPrivate: false }, { createdBy: userId }, { _id: { $in: memberProjectIds } }],
      })
      .select('_id');

    return projects.map((p) => p._id.toString());
  }

  async create(createdBy: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    const projectDto = {
      createdBy,
      ...dto,
    };

    return await this.projectModel.create(projectDto);
  }

  async update(id: string, userId: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const updated = await this.projectModel.findOneAndUpdate(
      { _id: id, createdBy: userId, deletedAt: null },
      { $set: dto },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Project not found');
    }

    return updated;
  }

  async findAll(userId: string): Promise<ProjectDocument[]> {
    const memberProjectIds = await this.taskService.getProjectIdsAssignedToUser(userId);

    const projects = await this.projectModel.find({
      deletedAt: null,
      $or: [{ isPrivate: false }, { createdBy: userId }, { _id: { $in: memberProjectIds } }],
    });

    return projects;
  }

  async isProjectVisibleToUser(projectId: string, userId: string): Promise<boolean> {
    const memberProjectIds = await this.taskService.getProjectIdsAssignedToUser(userId);

    const project = await this.projectModel.exists({
      _id: projectId,
      deletedAt: null,
      $or: [{ isPrivate: false }, { createdBy: userId }, { _id: { $in: memberProjectIds } }],
    });

    if (!project) {
      throw new ForbiddenException('You are forbidden to access this project');
    }

    return true;
  }

  async findOne(id: string, userId: string): Promise<ProjectDocument | null> {
    await this.isProjectVisibleToUser(id, userId);

    return await this.projectModel
      .findOne({ _id: id, deletedAt: null })
      .populate({
        path: 'tasks',
        populate: [{ path: 'user' }, { path: 'subTasks' }, { path: 'members' }],
      })
      .populate('user');
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const updated = await this.projectModel.findOneAndUpdate(
      { _id: id, createdBy: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    return !!updated;
  }
}
