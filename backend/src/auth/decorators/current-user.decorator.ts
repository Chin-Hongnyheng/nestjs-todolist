import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../../enums/role.enum';

export interface AuthUser {
  id: number;
  role: Role;
  email?: string;
  permissions?: string[];
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);
