import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import type { AuthenticatedRequest } from 'common/types';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.projectsService.create(req.user.userId!, createProjectDto);

    return res.status(201).json({
      message: 'Project created',
      data,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.projectsService.findAll(req.user.userId!);

    return res.status(200).json({
      message: 'All projects fetched',
      data,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.projectsService.findOne(id, req.user.userId!);

    return res.status(200).json({
      message: 'Project fetched',
      data,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.projectsService.update(id, req.user.userId!, updateProjectDto);

    return res.status(200).json({
      message: 'Project updated',
      data,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const deleted = await this.projectsService.remove(id, req.user.userId!);

    return res.status(deleted ? 200 : 400).json({
      message: deleted ? 'Project deleted successfully' : 'Project deletion failed',
    });
  }
}
