import { CanActivate, ExecutionContext, ForbiddenException, mixin } from "@nestjs/common";
import { Request } from 'express';
import { Role } from "../types/user.types";
import { AccessLevel } from "../constants";

export const RoleGuard = (role: Role) => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request['user'];
      if (!user || !user.role || AccessLevel[user.role] < AccessLevel[role]) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
      return true;
    }
  }

  const guard = mixin(RoleGuardMixin);
  return guard;
}