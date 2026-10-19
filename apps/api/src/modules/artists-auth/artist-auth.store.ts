import type { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import type { ArtistsService } from '@modules/artists/artists.service'
import type { AccountAuthStore, SessionTokens } from '@modules/auth-core'
import type { Artist } from '@prisma/client'
import { type SessionClient, sessionActivity } from './session-client'

/** The artist account, session and token tables behind the shared auth core. */
export class ArtistAuthStore implements AccountAuthStore<Artist, SessionClient> {
  /** Creates a store over the artist tables. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly artists: ArtistsService,
    private readonly artistsPrivate: ArtistsPrivateService,
  ) {}

  findByEmail(email: string) {
    return this.artistsPrivate.findByEmail(email)
  }

  findForTwoFactorLogin(id: string) {
    return this.artistsPrivate.findById(id)
  }

  findForSession(id: string) {
    return this.artists.findById(id)
  }

  resetFailedLogins(id: string) {
    return this.prisma.artist.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  async incrementFailedLogins(id: string) {
    const [updated] = await this.prisma.artist.updateManyAndReturn({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true, lockedUntil: true },
    })
    return updated
  }

  setLockedUntil(id: string, lockedUntil: Date | null) {
    return this.prisma.artist.updateMany({ where: { id }, data: { lockedUntil } })
  }

  /** Artist sessions also record the device's user agent and last use (signed-in devices). */
  createSession(artistId: string, tokens: SessionTokens, client: SessionClient) {
    return this.prisma.artistSession.create({
      data: { ...tokens, artistId, ...sessionActivity(client) },
    })
  }

  rotateSession(
    artistId: string,
    refreshTokenHash: string,
    next: SessionTokens,
    client: SessionClient,
  ) {
    return this.prisma.artistSession.updateMany({
      where: { artistId, refresh_token: refreshTokenHash },
      data: { ...next, ...sessionActivity(client) },
    })
  }

  deleteSession(artistId: string, accessTokenHash: string) {
    return this.prisma.artistSession.deleteMany({
      where: { artistId, access_token: accessTokenHash },
    })
  }

  async replacePasswordReset(artistId: string, token: string, expiresAt: Date) {
    await this.prisma.artistPasswordReset.deleteMany({ where: { artistId } })
    await this.prisma.artistPasswordReset.create({ data: { artistId, token, expiresAt } })
  }

  async findPasswordReset(token: string) {
    const reset = await this.prisma.artistPasswordReset.findUnique({ where: { token } })
    return reset && { accountId: reset.artistId, expiresAt: reset.expiresAt }
  }

  applyPasswordReset(artistId: string, token: string, password: string) {
    return this.prisma.$transaction([
      this.prisma.artist.update({ where: { id: artistId }, data: { password } }),
      this.prisma.artistPasswordReset.delete({ where: { token } }),
      this.prisma.artistSession.deleteMany({ where: { artistId } }),
    ])
  }

  replaceEmailVerification(artistId: string, token: string, expiresAt: Date) {
    return this.prisma.$transaction([
      this.prisma.artistEmailVerification.deleteMany({ where: { artistId } }),
      this.prisma.artistEmailVerification.create({ data: { artistId, token, expiresAt } }),
    ])
  }

  async findEmailVerification(token: string) {
    const verification = await this.prisma.artistEmailVerification.findUnique({
      where: { token },
    })
    return verification && { accountId: verification.artistId, expiresAt: verification.expiresAt }
  }

  markEmailVerified(artistId: string) {
    return this.prisma.$transaction([
      this.prisma.artist.update({ where: { id: artistId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.artistEmailVerification.deleteMany({ where: { artistId } }),
    ])
  }
}
