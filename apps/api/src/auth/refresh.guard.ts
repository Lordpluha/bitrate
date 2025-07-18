import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { JWTPayload } from './types'

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromCookie(request)

    if (!token) {
      throw new UnauthorizedException('No refresh token found')
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
        secret: process.env.JWT_SECRET
      })
      request[process.env.REFRESH_TOKEN_NAME!] = token
      request['user'] = payload
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
    return true
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const name = process.env.REFRESH_TOKEN_NAME!
    return request.cookies?.[name] as string | undefined
  }
}
