import { PrismaService } from '@infra/prisma/prisma.service'
import type { JWTPayload } from '@modules/tokens'
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
  type Type,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger'
import type { Request } from 'express'
import type { AuthAudience } from './account-auth.core'
import { UNAUTHORIZED_ERRORS } from './unauthorized.errors'

/** Defines the token requirement. */
export type TokenRequirement = 'access' | 'refresh'
/** The token requirement value. */
const TOKEN_REQUIREMENT = 'tokenRequirement'

/** The access and refresh cookies of a request, by the configured cookie names. */
export function extractAuthCookies(request: Request, tokenService: TokenService) {
  const accessToken = request.cookies?.[tokenService.getTokenName('access')] as string | undefined
  const refreshToken = request.cookies?.[tokenService.getTokenName('refresh')] as string | undefined
  return { accessToken, refreshToken }
}

/**
 * Metadata wrapper to control a session guard: which token the route requires, the Swagger
 * cookie and 401 documentation, and the guard itself.
 */
export function sessionAuth(guard: Type<CanActivate>, tokenRequirement: TokenRequirement) {
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
          code: {
            type: 'string',
            description:
              'Stable machine-readable error code (the message key); omitted for untranslated legacy messages.',
            enum: Object.values(UNAUTHORIZED_ERRORS),
            example: UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN,
          },
        },
      },
    }),
    UseGuards(guard),
  )
}

/** The hashed cookies a session lookup must match; an absent cookie is not constrained. */
export interface SessionTokenHashes {
  access_token?: string
  refresh_token?: string
}

/**
 * Verifies the token a route requires, then that its account is active and that an unexpired
 * session holds the presented cookies. Each audience supplies the lookups against its own
 * tables and where the account is attached on the request.
 */
@Injectable()
export abstract class SessionAuthGuard<Account> implements CanActivate {
  private readonly logger = new Logger(this.constructor.name)
  /** The JWT `type` this guard accepts. */
  protected abstract readonly audience: AuthAudience

  /** Creates a new instance. */
  constructor(
    protected prisma: PrismaService,
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  /** The active (not soft-deleted) account with this id. */
  protected abstract findAccount(id: string): Promise<Account | null>
  /** An unexpired session of the account matching the presented cookies. */
  protected abstract findSession(accountId: string, tokens: SessionTokenHashes): Promise<unknown>
  /** Attaches the authenticated account to the request. */
  protected abstract attach(request: Request, account: Account): void

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

      if (payload.type !== this.audience)
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const account = await this.findAccount(payload.sub)
      if (!account) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.USER_NOT_FOUND)

      const session = await this.findSession(payload.sub, {
        ...(access_token && { access_token: this.tokenService.hashToken(access_token) }),
        ...(refresh_token && { refresh_token: this.tokenService.hashToken(refresh_token) }),
      })
      if (!session) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      this.attach(request, account)
      if (access_token) request[this.tokenService.getTokenName('access')] = access_token
      if (refresh_token) request[this.tokenService.getTokenName('refresh')] = refresh_token
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error(`Unexpected error in ${this.constructor.name}`, error)
      throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
    }

    return true
  }
}
