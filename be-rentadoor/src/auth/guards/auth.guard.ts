import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();

      try {
        // Obtener el token desde las cookies en lugar de headers
        let token = request.cookies?.authToken;
        
        // Fallback: obtener token desde header si no está en cookies
        if (!token) {
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          }
        }

        if (!token) {
          throw new ForbiddenException('No token provided');
        }
        
        const secret = process.env.JWT_SECRET;
        
        // Intentar verificar el token paso a paso
        try {
          const payload = this.jwtService.verify(token, { secret });
          
          request.iat = new Date(payload.iat * 1000);
          request.exp = new Date(payload.exp * 1000);

          request.user = {
            id: payload.id,
            email: payload.email,
            verified: payload.verified,
            rol: payload.role 
          };

          return true;
        } catch (verifyError) {
          throw verifyError;
        }
      } catch (error) {
        console.error('AuthGuard error:', error);
        throw new UnauthorizedException(
          'Access denied, check either your token or your credentials',
        );
      }
    }
  }