import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.tasksService.create(req.user.userId!, createTaskDto);

    return res.status(201).json({
      message: 'Task Created',
      data,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Res() res: Response) {
    const data = await this.tasksService.findStandAloneTasks();

    return res.status(200).json({
      message: 'All Tasks fetched',
      data,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.tasksService.findOne(id, req.user.userId!);

    return res.status(200).json({
      message: 'Task fetched',
      data,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.tasksService.update(id, req.user.userId!, updateTaskDto);

    return res.status(200).json({
      message: 'Task updated successfully',
      data,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const deleted = await this.tasksService.remove(id, req.user.userId!);

    return res.status(deleted ? 200 : 400).json({
      message: deleted ? 'Task deleted successfully' : 'Task deletion failed',
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    const data = await this.tasksService.updateStatus(id, req.user.userId!, dto);

    return res.status(200).json({
      message: 'Task status updated',
      data,
    });
  }
}
