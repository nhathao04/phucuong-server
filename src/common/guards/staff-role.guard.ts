import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "../../modules/users/users.service";

type JwtRequestUser = {
  sub?: string;
  role?: string;
};

@Injectable()
export class StaffRoleGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtRequestUser }>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException("Unauthorized");
    }

    const user = await this.usersService.findByIdWithRole(userId);
    if (!user || !user.role) {
      throw new ForbiddenException("Only admin or staff can access");
    }

    const roleName = user.role.name?.trim();
    if (!roleName) {
      throw new ForbiddenException("Only admin or staff can access");
    }

    if (["admin", "staff"].includes(roleName.toLowerCase())) {
      request.user = {
        ...request.user,
        role: roleName,
      };
      return true;
    }

    throw new ForbiddenException("Only admin or staff can access");
  }
}
