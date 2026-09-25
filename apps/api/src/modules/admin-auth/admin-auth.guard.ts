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
import { hasPermission, type Permission, REQUIRED_PERMISSION } from './access'
import { InsufficientPermissionException, UNAUTHORIZED_ERRORS } from './errors'
import type { AdminAuthRequest } from './types'

/** The staff request shape used by this guard, layered on top of Express's `Request`. */
type StaffRequest = Request & Partial<AdminAuthRequest>

/** Defines the token requirement. */
type TokenRequirement = 'access' | 'refresh'
/** The token requirement value. */
const TOKEN_REQUIREMENT = 'tokenRequirement'

/**
 * Requires an authenticated staff session. This is the floor, not the whole story: it belongs
 * on the controller class, and grants nothing on its own — a route also needs
 * `@RequirePermission(...)` (or is explicitly session-only) to do anything beyond exist.
 * @returns Decorator wiring up the guard and its Swagger surface.
 */
export function AdminAuth() {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, 'access' satisfies TokenRequirement),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME),
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
    UseGuards(AdminAuthGuard),
  )
}

/**
 * Wraps AdminAuth for a refresh-token route: verifies the refresh cookie
 * instead of the access cookie. No permission is checked — the account itself
 * is the requirement.
 */
export function AdminRefreshAuth() {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, 'refresh' satisfies TokenRequirement),
    ApiCookieAuth(process.env.REFRESH_TOKEN_NAME),
    UseGuards(AdminAuthGuard),
  )
}

/** Represents the admin (staff) auth guard. */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name)

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
    const requiredPermission = this.reflector.getAllAndOverride<Permission | undefined>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    )

    const request = context.switchToHttp().getRequest<StaffRequest>()
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

      if (payload.type !== 'staff')
        throw new UnauthorizedException(UNAUTHORIZED_ERRORS.STAFF_NOT_FOUND)

      const staff = await this.prisma.staff.findFirst({
        where: { id: payload.sub, deletedAt: null },
        include: { role: { select: { name: true, builtIn: true } } },
      })
      if (!staff) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.STAFF_NOT_FOUND)

      const session = await this.prisma.staffSession.findFirst({
        where: {
          ...(access_token && { access_token: this.tokenService.hashToken(access_token) }),
          ...(refresh_token && { refresh_token: this.tokenService.hashToken(refresh_token) }),
          staffId: payload.sub,
          expiresAt: { gt: new Date() },
        },
      })
      if (!session) throw new UnauthorizedException(UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND)

      if (requiredPermission && !hasPermission({ staff, permission: requiredPermission })) {
        throw new InsufficientPermissionException(requiredPermission)
      }

      request.staff = staff
      if (access_token) request[this.tokenService.getTokenName('access')] = access_token
      if (refresh_token) request[this.tokenService.getTokenName('refresh')] = refresh_token
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error('Unexpected error in AdminAuthGuard', error)
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
