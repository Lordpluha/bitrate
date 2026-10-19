import { PrismaService } from '@infra/prisma/prisma.service'
import {
  extractAuthCookies,
  SessionAuthGuard,
  type SessionTokenHashes,
  sessionAuth,
  type TokenRequirement,
} from '@modules/auth-core'
import {
  applyDecorators,
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { User } from '@prisma/client'
import type { Request } from 'express'
import type { JWTPayload } from '../tokens'
import { TokenService } from '../tokens/token.service'

export type { TokenRequirement } from '@modules/auth-core'

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function UserAuth(tokenRequirement: TokenRequirement = 'access') {
  return sessionAuth(UserAuthGuard, tokenRequirement)
}

/** Allows public access while attaching the authenticated user when cookies are valid. */
export function OptionalUserAuth() {
  return applyDecorators(UseGuards(OptionalUserAuthGuard))
}

/** Represents the user auth guard. */
@Injectable()
export class UserAuthGuard extends SessionAuthGuard<User> {
  protected readonly audience = 'user' as const

  /**
   * Declared here rather than inherited: Nest reads the constructor's parameter types from
   * this class's own `design:paramtypes`, which TypeScript only emits for a written constructor.
   */
  constructor(prisma: PrismaService, reflector: Reflector, tokenService: TokenService) {
    super(prisma, reflector, tokenService)
  }

  protected findAccount(id: string) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } })
  }

  protected findSession(userId: string, tokens: SessionTokenHashes) {
    return this.prisma.userSession.findFirst({
      where: { ...tokens, expiresAt: { gt: new Date() }, userId },
    })
  }

  protected attach(request: Request, user: User) {
    request.user = user
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

      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
      })
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
