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
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromCookie(request)

    if (!token) {
      throw new UnauthorizedException('No authentication token found')
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
        secret: process.env.JWT_SECRET
      })
      request['user'] = payload
      request[process.env.ACCESS_TOKEN_NAME!] = token
      request[process.env.REFRESH_TOKEN_NAME!] = request.cookies[
        process.env.REFRESH_TOKEN_NAME!
      ] as string
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
    return true
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const name = process.env.ACCESS_TOKEN_NAME!
    return request.cookies?.[name] as string | undefined
  }
}
