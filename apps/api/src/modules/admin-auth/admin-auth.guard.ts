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
import type { StaffRole } from '@prisma/client'
import type { Request } from 'express'
import type { JWTPayload } from '../tokens'
import { InsufficientRoleException, UNAUTHORIZED_ERRORS } from './errors'
import type { AdminAuthRequest } from './types'

/** The staff request shape used by this guard, layered on top of Express's `Request`. */
type StaffRequest = Request & Partial<AdminAuthRequest>

/** Defines the token requirement. */
export type TokenRequirement = 'access' | 'refresh'
/** The token requirement value. */
export const TOKEN_REQUIREMENT = 'tokenRequirement'
/** The required-roles metadata key. */
export const REQUIRED_ROLES = 'requiredStaffRoles'

/**
 * Metadata wrapper to control AdminAuthGuard behavior.
 *
 * With no roles given, any authenticated staff member (any role) passes. With
 * roles given, the staff member's `role` must be one of them.
 * @param roles Roles allowed to access the route; empty means any staff role.
 * @returns Decorator function that wires up the guard and its Swagger surface.
 */
export function AdminAuth(...roles: StaffRole[]) {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, 'access' satisfies TokenRequirement),
    SetMetadata(REQUIRED_ROLES, roles),
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
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient staff role' }),
    UseGuards(AdminAuthGuard),
  )
}

/**
 * Narrows the role a single route accepts, below the floor its controller declares.
 *
 * Deliberately metadata-only: `AdminAuth` belongs on the controller class, where it attaches
 * the guard and documents the cookie scheme once. Reaching for `AdminAuth` again on a method
 * to change the roles applies `ApiCookieAuth` a second time, and the generated spec then lists
 * the same requirement twice — `security: [{ cookie: [] }, { cookie: [] }]`. The guard reads
 * roles with `getAllAndOverride`, so metadata alone is all a narrowing needs.
 *
 * Widening past the class floor is not possible this way and should not be: a route that needs
 * more than its controller allows belongs on a different controller.
 *
 * The 403 response is declared here and not left to the class, because a method-level
 * `ApiResponse` replaces the class's for that status rather than merging with it. Dropping it
 * silently rewrote the generated description of every narrowed route from "Requires the ADMIN
 * role / Insufficient staff role" down to the first line alone.
 * @param roles Roles allowed on this route; must be a subset of the controller's.
 * @returns Decorator setting the required-roles metadata and the role-failure response.
 */
export function StaffRoles(...roles: StaffRole[]) {
  return applyDecorators(
    SetMetadata(REQUIRED_ROLES, roles),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient staff role' }),
  )
}

/**
 * Wraps AdminAuth for a refresh-token route: verifies the refresh cookie
 * instead of the access cookie, with no role restriction (the account itself
 * is the requirement).
 */
export function AdminRefreshAuth() {
  return applyDecorators(
    SetMetadata(TOKEN_REQUIREMENT, 'refresh' satisfies TokenRequirement),
    SetMetadata(REQUIRED_ROLES, [] as StaffRole[]),
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
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(REQUIRED_ROLES, [
      context.getHandler(),
      context.getClass(),
    ])

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

      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(staff.role)) {
        throw new InsufficientRoleException(requiredRoles)
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
