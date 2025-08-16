import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { JWTPayload } from './types'
import { PrismaService } from 'src/prisma/prisma.service'

import { SetMetadata, UseGuards } from '@nestjs/common'
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'
import { TokenService } from './token.service'

export type TokenRequirement = 'access' | 'refresh'
export const TOKEN_REQUIREMENT = 'tokenRequirement'

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function Auth(tokenRequirement: TokenRequirement = 'access') {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, tokenRequirement),
    ApiCookieAuth(
      tokenRequirement === 'access'
        ? process.env.ACCESS_TOKEN_NAME
        : process.env.REFRESH_TOKEN_NAME
    ),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
          message: {
            type: 'string',
            enum: Object.values(UNAUTHORIZED_ERRORS),
            example: UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN
          },
          error: { type: 'string', example: 'Unauthorized' }
        }
      }
    }),
    UseGuards(AuthGuard)
  )
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private tokenService: TokenService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenReq = this.reflector.getAllAndOverride<TokenRequirement>(
      TOKEN_REQUIREMENT,
      [context.getHandler(), context.getClass()]
    )

    const request = context.switchToHttp().getRequest<Request>()
    // Try to extract tokens from both cookies and Authorization header
    const { access_token: cookieAccessToken, refresh_token } =
      this.extractTokenFromCookie(request)

    // If not found in cookies, try Authorization header
    const access_token =
      cookieAccessToken || this.extractTokenFromHeader(request)

    // 1) проверяем наличие нужных токенов
    switch (tokenReq) {
      case 'access':
        if (!access_token)
          throw new UnauthorizedException(
            UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED
          )
        break
      case 'refresh':
        if (!refresh_token)
          throw new UnauthorizedException(
            UNAUTHORIZED_ERRORS.REFRESH_TOKEN_REQUIRED
          )
        break
      default:
        throw new UnauthorizedException(
          UNAUTHORIZED_ERRORS.INVALID_TOKEN_REQUIREMENT
        )
    }

    try {
      // 2) верификация
      let payload: JWTPayload
      if (access_token && 'access' === tokenReq) {
        payload = await this.tokenService.verifyToken(access_token)
      } else {
        payload = await this.tokenService.verifyToken(refresh_token!)
      }

      if (refresh_token) {
        await this.tokenService.verifyToken(refresh_token)
      }

      // 3) получаем юзера
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      })
      if (!user)
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      // 4) ищем сессию по всем пришедшим токенам
      const session = await this.prisma.session.findFirst({
        where: {
          access_token,
          refresh_token,
          userId: payload.sub
        }
      })
      if (!session)
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      request['user'] = user
      if (access_token) request[process.env.ACCESS_TOKEN_NAME!] = access_token
      if (refresh_token)
        request[process.env.REFRESH_TOKEN_NAME!] = refresh_token
    } catch {
      throw new UnauthorizedException(
        UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN
      )
    }

    return true
  }

  private extractTokenFromCookie(request: Request) {
    const access_token_name = process.env.ACCESS_TOKEN_NAME || ''
    const refresh_token_name = process.env.REFRESH_TOKEN_NAME || ''
    const access_token = request.cookies?.[access_token_name] as
      | string
      | undefined
    const refresh_token = request.cookies?.[refresh_token_name] as
      | string
      | undefined
    return { access_token, refresh_token }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.slice(7) // Remove 'Bearer ' prefix
    }
    return undefined
  }
}
