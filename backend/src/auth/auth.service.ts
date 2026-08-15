import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRole } from 'common/enums';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { GoogleUser } from 'common/types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<UserDocument> {
    return await this.userService.findOrCreateByGoogleId(googleUser);
  }

  issueUserToken(userId: string): string {
    return this.jwtService.sign({
      userId,
      role: AuthRole.User,
    });
  }

  issueGuestToken(): string {
    return this.jwtService.sign({
      role: AuthRole.Guest,
    });
  }
}
