import { PrismaService } from '@infra/prisma/prisma.service'
import { TokenService } from '@modules/tokens/token.service'
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma, type Staff, type StaffSession } from '@prisma/client'
import type { JWTPayload } from '../tokens'
import { STAFF_SAFE_SELECT } from './staff.select'

/** A completed staff sign-in: the token pair a session is built from. */
type StaffTokenPair = {
  access_token: string
  refresh_token: string
}

/** Represents the admin (staff) auth service. */
@Injectable()
export class AdminAuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCK_DURATION_MS = 15 * 60 * 1000

  /** Creates a new instance. */
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
  ) {}

  /** Runs the login staff operation. There is no self-registration — accounts are provisioned manually. */
  async loginStaff(email: Staff['email'], password: string): Promise<StaffTokenPair> {
    const staff = await this.prisma.staff.findFirst({ where: { email, deletedAt: null } })
    if (staff?.lockedUntil && staff.lockedUntil > new Date()) {
      throw new HttpException('Account is temporarily locked', HttpStatus.TOO_MANY_REQUESTS)
    }

    const passwordValid = staff && (await this.token.verifyPassword(password, staff.password))
    if (!passwordValid) {
      if (staff) await this.recordFailedLogin(staff.id)
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    if (staff.failedLoginAttempts > 0 || staff.lockedUntil) {
      await this.prisma.staff.update({
        where: { id: staff.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      })
    }

    return await this.issueSession(staff)
  }

  /** Runs the refresh operation. */
  async refresh(refresh_token: string): Promise<StaffTokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.JWT_SECRET,
      })
      const staff = await this.prisma.staff.findFirst({
        where: { id: payload.sub, deletedAt: null },
      })
      if (!staff) throw new UnauthorizedException('Invalid refresh token')

      const access_token = await this.token.generateAccessToken(staff.id, staff.username, 'staff')
      const next_refresh_token = await this.token.generateRefreshToken(
        staff.id,
        staff.username,
        'staff',
      )

      const updatedSessions = await this.prisma.staffSession.updateMany({
        where: {
          staffId: staff.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
          refresh_token: this.token.hashToken(next_refresh_token),
          expiresAt: this.token.getRefreshTokenExpiresAt(),
        },
      })

      if (updatedSessions.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return { access_token, refresh_token: next_refresh_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /** Runs the logout operation. */
  async logout(staffId: StaffSession['staffId'], access_token: StaffSession['access_token']) {
    const staff = await this.prisma.staff.findFirst({ where: { id: staffId, deletedAt: null } })
    if (!staff) {
      throw new UnauthorizedException('Invalid access token')
    }

    await this.prisma.staffSession.deleteMany({
      where: {
        staffId: staff.id,
        access_token: this.token.hashToken(access_token),
      },
    })
  }

  /** Returns the currently authenticated staff member, with secret material stripped. */
  async me(staffId: Staff['id']) {
    return await this.prisma.staff.findFirst({
      where: { id: staffId, deletedAt: null },
      select: STAFF_SAFE_SELECT,
    })
  }

  private async issueSession(staff: Staff): Promise<StaffTokenPair> {
    const access_token = await this.token.generateAccessToken(staff.id, staff.username, 'staff')
    const refresh_token = await this.token.generateRefreshToken(staff.id, staff.username, 'staff')

    await this.prisma.staffSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        staffId: staff.id,
        expiresAt: this.token.getRefreshTokenExpiresAt(),
      },
    })

    return { access_token, refresh_token }
  }

  private async recordFailedLogin(staffId: string) {
    const lockedUntil = new Date(Date.now() + AdminAuthService.LOCK_DURATION_MS)
    await this.prisma.executeRaw(Prisma.sql`
      UPDATE "Staff"
      SET
        "failedLoginAttempts" = "failedLoginAttempts" + 1,
        "lockedUntil" = CASE
          WHEN "failedLoginAttempts" + 1 >= ${AdminAuthService.MAX_LOGIN_ATTEMPTS}
          THEN ${lockedUntil}
          ELSE NULL
        END
      WHERE "id" = ${staffId}::uuid
    `)
  }
}
