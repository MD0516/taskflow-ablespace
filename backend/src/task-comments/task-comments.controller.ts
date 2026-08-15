import { Controller, Post, Body, Param, Delete, Res, Req, UseGuards } from '@nestjs/common';
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller()
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Post('task/:id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Param('id') id: string,
    @Body() createTaskCommentDto: CreateTaskCommentDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.taskCommentsService.create(id, req.user.userId!, createTaskCommentDto);

    return res.status(201).json({
      message: 'Comment posted',
      data,
    });
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const deleted = await this.taskCommentsService.remove(id, req.user.userId!);

    return res.status(deleted ? 200 : 400).json({
      message: deleted ? 'Comment deleted successfully' : 'Comment deletion failed',
    });
  }
}
