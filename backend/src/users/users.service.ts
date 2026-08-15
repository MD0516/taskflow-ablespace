import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from 'common/types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findOrCreateByGoogleId(googleUser: {
    googleId: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }): Promise<UserDocument> {
    const exists = await this.userModel.findOne({
      googleId: googleUser.googleId,
    });

    if (exists) {
      return exists;
    }

    const user = await this.userModel.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      avatarUrl: googleUser.avatarUrl,
    });

    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find();
  }

  async getMe(reqUser: JwtPayload): Promise<UserDocument> {
    const user = await this.userModel.findById(reqUser.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, { $set: dto }, { new: true });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
