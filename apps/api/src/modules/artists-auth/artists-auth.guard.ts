import { PrismaService } from '@infra/prisma/prisma.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  applyDecorators,
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger'
import type { Request } from 'express'
import type { JWTPayload } from '../tokens'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'

/** Defines the token requirement. */
export type TokenRequirement = 'access' | 'refresh'
/** The token requirement value. */
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

/** Represents the artist auth guard. */
@Injectable()
export class ArtistAuthGuard implements CanActivate {
  private readonly logger = new Logger(ArtistAuthGuard.name)

  /** Creates a new instance. */
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  /** Runs the can activate operation. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenReq = this.reflector.getAllAndOverride<TokenRequirement>(TOKEN_REQUIREMENT, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    const { access_token, refresh_token } = this.extractTokenFromCookie(request)

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
      const token = tokenReq === 'access' ? access_token! : refresh_token!
      const payload: JWTPayload = await this.tokenService.verifyToken(token)

      if (tokenReq === 'access' && refresh_token) {
        await this.tokenService.verifyToken(refresh_token)
      }

      if (payload.type !== 'artist')
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const artist = await this.prisma.artist.findUnique({ where: { id: payload.sub } })
      if (!artist) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const session = await this.prisma.artistSession.findFirst({
        where: {
          ...(access_token && { access_token: this.tokenService.hashToken(access_token) }),
          ...(refresh_token && { refresh_token: this.tokenService.hashToken(refresh_token) }),
          artistId: payload.sub,
        },
      })
      if (!session) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      request.artist = artist
      if (access_token) request[this.tokenService.getTokenName('access')] = access_token
      if (refresh_token) request[this.tokenService.getTokenName('refresh')] = refresh_token
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error('Unexpected error in ArtistAuthGuard', error)
      throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
    }

    return true
  }

  /** Runs the extract token from cookie operation. */
  private extractTokenFromCookie(request: Request) {
    const access_token = request.cookies?.[this.tokenService.getTokenName('access')] as
      | string
      | undefined
    const refresh_token = request.cookies?.[this.tokenService.getTokenName('refresh')] as
      | string
      | undefined
    return { access_token, refresh_token }
  }
}
