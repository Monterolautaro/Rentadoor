import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Roles } from '../../common/enums/roles.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      const request = context.switchToHttp().getRequest();
  
      const user = request.user;
  
      const hasRole = () =>
        requiredRoles.some((role) => user?.rol === role);
  
      const valid = user && user.rol && hasRole();
  
      if (!valid) {
        throw new ForbiddenException(
          "You don't have permission to access this resource",
        );
      }
  
      return true;
    }
  }