import { PrismaService } from '@infra/prisma/prisma.service'
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
import { TokenService } from '../tokens/token.service'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'

/** Defines the token requirement. */
export type TokenRequirement = 'access' | 'refresh'
/** The token requirement value. */
export const TOKEN_REQUIREMENT = 'tokenRequirement'

function extractAuthCookies(request: Request, tokenService: TokenService) {
  const accessToken = request.cookies?.[tokenService.getTokenName('access')] as string | undefined
  const refreshToken = request.cookies?.[tokenService.getTokenName('refresh')] as string | undefined
  return { accessToken, refreshToken }
}

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function UserAuth(tokenRequirement: TokenRequirement = 'access') {
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
    UseGuards(UserAuthGuard),
  )
}

/** Allows public access while attaching the authenticated user when cookies are valid. */
export function OptionalUserAuth() {
  return applyDecorators(UseGuards(OptionalUserAuthGuard))
}

/** Represents the user auth guard. */
@Injectable()
export class UserAuthGuard implements CanActivate {
  private readonly logger = new Logger(UserAuthGuard.name)

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
    const { accessToken: access_token, refreshToken: refresh_token } = extractAuthCookies(
      request,
      this.tokenService,
    )

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
      /**
       * Only the token this route requires is verified. A co-present cookie of
       * the other kind is never checked here — a client can always omit it, so
       * verifying it added no guarantee and only rejected legitimate requests
       * whose unrelated cookie happened to be stale.
       */
      const token = tokenReq === 'access' ? access_token! : refresh_token!
      const payload: JWTPayload = await this.tokenService.verifyToken(token)

      if (payload.type !== 'user')
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const session = await this.prisma.userSession.findFirst({
        where: {
          ...(access_token && { access_token: this.tokenService.hashToken(access_token) }),
          ...(refresh_token && { refresh_token: this.tokenService.hashToken(refresh_token) }),
          expiresAt: { gt: new Date() },
          userId: payload.sub,
        },
      })
      if (!session) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      request.user = user
      if (access_token) request[this.tokenService.getTokenName('access')] = access_token
      if (refresh_token) request[this.tokenService.getTokenName('refresh')] = refresh_token
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error('Unexpected error in UserAuthGuard', error)
      throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
    }

    return true
  }
}

/** Represents the optional user auth guard. */
@Injectable()
export class OptionalUserAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalUserAuthGuard.name)
  /** Creates a new instance. */
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  /** Runs the can activate operation. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const { accessToken: access_token, refreshToken: refresh_token } = extractAuthCookies(
      request,
      this.tokenService,
    )
    if (!access_token) return true

    try {
      const payload: JWTPayload = await this.tokenService.verifyToken(access_token)
      if (payload.type !== 'user') return true

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) return true

      const session = await this.prisma.userSession.findFirst({
        where: {
          access_token: this.tokenService.hashToken(access_token),
          ...(refresh_token && {
            refresh_token: this.tokenService.hashToken(refresh_token),
          }),
          expiresAt: { gt: new Date() },
          userId: payload.sub,
        },
      })
      if (session) request.user = user
    } catch (error) {
      this.logger.debug('Optional authentication cookies are invalid', error)
    }

    return true
  }
}
