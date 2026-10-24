import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException(
        'Access denied: No permissions attached to this user',
      );
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(
        (perm) => !user.permissions.includes(perm),
      );
      throw new ForbiddenException(
        `Access denied: Missing required permission(s): [${missing.join(', ')}]`,
      );
    }

    return true;
  }
}
