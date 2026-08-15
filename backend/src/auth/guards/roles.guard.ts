import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthRole } from 'common/enums';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from 'common/types';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = req.user;

    if (user?.role === AuthRole.Guest) {
      throw new ForbiddenException('Guests cannot perform this action');
    }

    return true;
  }
}
