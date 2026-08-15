import { Controller, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { SubTasksService } from './sub-tasks.service';
import { CreateBulkSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateBulkSubTaskDto } from './dto/update-sub-task.dto';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DeleteSubTaskDto } from './dto/delete-sub-task.dto';

@Controller('tasks')
export class SubTasksController {
  constructor(private readonly subTasksService: SubTasksService) {}

  @Post(':id/subtasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Param('id') id: string,
    @Body() createSubTaskDto: CreateBulkSubTaskDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.subTasksService.create(req.user.userId!, id, createSubTaskDto);

    return res.status(201).json({
      message: 'Subtasks created',
      data,
    });
  }

  @Patch(':id/subtasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSubTaskDto: UpdateBulkSubTaskDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.subTasksService.update(id, req.user.userId!, updateSubTaskDto);

    return res.status(200).json({
      message: 'Subtasks updated',
      data,
    });
  }

  @Delete(':id/subtasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(
    @Param('id') id: string,
    @Body() deleteSubTaskDto: DeleteSubTaskDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.subTasksService.remove(id, req.user.userId!, deleteSubTaskDto);

    return res.status(200).json({
      message: 'Subtasks deleted',
      data,
    });
  }
}
