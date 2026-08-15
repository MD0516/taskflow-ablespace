import { Controller, Get, Body, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'common/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Res() res: Response) {
    const data = await this.usersService.findAll();

    return res.status(200).json({
      message: 'Fetched all users',
      data,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.usersService.getMe(req.user);

    return res.status(200).json({
      message: 'User fetched',
      data,
    });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(req.user.userId!, dto);

    return res.status(200).json({
      message: 'User details updated',
      data,
    });
  }
}
