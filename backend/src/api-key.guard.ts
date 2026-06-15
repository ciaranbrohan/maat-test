import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-api-key'];
    if (!process.env.API_KEY || key !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
