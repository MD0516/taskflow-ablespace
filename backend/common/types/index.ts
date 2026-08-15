import { AuthRole } from 'common/enums';
import type { Request } from 'express';

export interface GoogleUser {
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface JwtPayload {
  userId?: string;
  role: AuthRole;
}

export interface GoogleAuthRequest extends Request {
  user: GoogleUser;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
