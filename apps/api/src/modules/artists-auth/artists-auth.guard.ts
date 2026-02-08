import { PrismaService } from '@infra/prisma/prisma.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger'
import { Request } from 'express'
import { JWTPayload } from '../tokens'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'

export type TokenRequirement = 'access' | 'refresh'
export const TOKEN_REQUIREMENT = 'tokenRequirement'

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function ArtistAuth(tokenRequirement: TokenRequirement = 'access') {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, tokenRequirement),
    ApiCookieAuth(
      tokenRequirement === 'access'
        ? process.env.ACCESS_TOKEN_NAME
        : process.env.REFRESH_TOKEN_NAME,
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
            example: UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN,
          },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    UseGuards(ArtistAuthGuard),
  )
}

@Injectable()
export class ArtistAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenReq = this.reflector.getAllAndOverride<TokenRequirement>(TOKEN_REQUIREMENT, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    // Extract tokens from httpOnly cookies
    const { access_token, refresh_token } = this.extractTokenFromCookie(request)

    // 1) проверяем наличие нужных токенов
    switch (tokenReq) {
      case 'access':
        if (!access_token)
          throw new UnauthorizedException(UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED)
        break
      case 'refresh':
        if (!refresh_token)
          throw new UnauthorizedException(UNAUTHORIZED_ERRORS.REFRESH_TOKEN_REQUIRED)
        break
      default:
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_TOKEN_REQUIREMENT)
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

      // 3) получаем артиста
      const artist = await this.prisma.artist.findUnique({
        where: { id: payload.sub },
      })
      if (!artist) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      // 4) ищем сессию по всем пришедшим токенам
      const session = await this.prisma.artistSession.findFirst({
        where: {
          access_token,
          refresh_token,
          artistId: payload.sub,
        },
      })
      if (!session) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      request['artist'] = artist
      if (access_token) request[process.env.ACCESS_TOKEN_NAME!] = access_token
      if (refresh_token) request[process.env.REFRESH_TOKEN_NAME!] = refresh_token
    } catch {
      throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
    }

    return true
  }

  private extractTokenFromCookie(request: Request) {
    const access_token_name = process.env.ACCESS_TOKEN_NAME!
    const refresh_token_name = process.env.REFRESH_TOKEN_NAME!
    const access_token = request.cookies?.[access_token_name] as string | undefined
    const refresh_token = request.cookies?.[refresh_token_name] as string | undefined
    return { access_token, refresh_token }
  }
}
