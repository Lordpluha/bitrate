import { PrismaService } from '@infra/prisma/prisma.service'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { ARTIST_AUTH_ERRORS } from './errors'

/** Most sessions an artist can list; refresh tokens expire, so real accounts stay well below. */
const SESSION_LIST_LIMIT = 50

/**
 * The artist's signed-in devices. The current session is told apart by its access token hash
 * and cannot be revoked here: ending it is a sign-out, which also clears the cookies.
 */
@Injectable()
export class ArtistSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
  ) {}

  async list(artistId: string, accessToken: string) {
    const currentHash = this.token.hashToken(accessToken)
    const sessions = await this.prisma.artistSession.findMany({
      where: { artistId, expiresAt: { gt: new Date() } },
      orderBy: [{ lastUsedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: SESSION_LIST_LIMIT,
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        access_token: true,
      },
    })
    return sessions.map(({ access_token, ...session }) => ({
      ...session,
      current: access_token === currentHash,
    }))
  }

  async revoke(artistId: string, id: string, accessToken: string) {
    const currentHash = this.token.hashToken(accessToken)
    const { count } = await this.prisma.artistSession.deleteMany({
      where: { id, artistId, NOT: { access_token: currentHash } },
    })
    if (count === 1) return
    const current = await this.prisma.artistSession.findFirst({
      where: { id, artistId, access_token: currentHash },
      select: { id: true },
    })
    if (current) throw new ConflictException(ARTIST_AUTH_ERRORS.SESSION_IS_CURRENT)
    throw new NotFoundException(ARTIST_AUTH_ERRORS.SESSION_NOT_FOUND)
  }

  /** Signs out every other device, keeping the one making the request. */
  async revokeOthers(artistId: string, accessToken: string) {
    const { count } = await this.prisma.artistSession.deleteMany({
      where: { artistId, NOT: { access_token: this.token.hashToken(accessToken) } },
    })
    return { revoked: count }
  }
}
