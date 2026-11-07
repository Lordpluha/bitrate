import { randomBytes, randomUUID } from 'node:crypto'
import { PrismaService } from '@infra/prisma/prisma.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ARTIST_AUTH_ERRORS } from './errors'
import { type SessionClient, sessionActivity } from './session-client'

export const SAVED_ACCOUNT_LIMIT = 5
const identitySelect = { id: true, username: true, avatar: true } satisfies Prisma.ArtistSelect
const liveSession = () => ({ expiresAt: { gt: new Date() }, artist: { deletedAt: null } })

@Injectable()
export class ArtistAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
  ) {}

  private hash(raw: string | undefined) {
    return raw && /^[a-f0-9]{64}$/.test(raw) ? this.token.hashToken(raw) : null
  }

  async list(artistId: string, raw: string | undefined) {
    const hash = this.hash(raw)
    const [current, saved] = await Promise.all([
      this.prisma.artist.findFirst({
        where: { id: artistId, deletedAt: null },
        select: identitySelect,
      }),
      hash
        ? this.prisma.artistAccountLink.findMany({
            where: { browserTokenHash: hash, session: liveSession() },
            orderBy: { addedAt: 'asc' },
            take: SAVED_ACCOUNT_LIMIT,
            select: { session: { select: { artist: { select: identitySelect } } } },
          })
        : Promise.resolve([]),
    ])
    if (!current) throw new UnauthorizedException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
    return {
      accounts: [
        current,
        ...saved.map((link) => link.session.artist).filter((artist) => artist.id !== current.id),
      ].map((artist) => ({ ...artist, current: artist.id === artistId })),
      limit: SAVED_ACCOUNT_LIMIT,
    }
  }

  async remember(artistId: string, accessToken: string, raw: string | undefined) {
    const browserToken = this.hash(raw) ? raw! : randomBytes(32).toString('hex')
    const browserTokenHash = this.token.hashToken(browserToken)
    await this.prisma.$transaction(async (tx) => {
      await this.lock(tx, browserTokenHash)
      await this.rememberCurrent(tx, artistId, accessToken, browserTokenHash)
    })
    return browserToken
  }

  async switchAccount(
    currentArtistId: string,
    accessToken: string,
    raw: string | undefined,
    artistId: string,
    client: SessionClient,
  ) {
    const browserTokenHash = this.hash(raw)
    if (!browserTokenHash) throw new NotFoundException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
    if (currentArtistId === artistId) return null
    return await this.prisma.$transaction(async (tx) => {
      await this.lock(tx, browserTokenHash)
      const target = await tx.artistAccountLink.findFirst({
        where: { browserTokenHash, artistId, session: liveSession() },
        select: {
          session: {
            select: { id: true, refresh_token: true, artist: { select: identitySelect } },
          },
        },
      })
      if (!target) throw new NotFoundException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
      await this.rememberCurrent(tx, currentArtistId, accessToken, browserTokenHash)
      const nonce = randomUUID()
      const access = await this.token.generateAccessToken(
        artistId,
        target.session.artist.username,
        'artist',
        nonce,
      )
      const refresh = await this.token.generateRefreshToken(
        artistId,
        target.session.artist.username,
        'artist',
        nonce,
      )
      const changed = await tx.artistSession.updateMany({
        where: {
          id: target.session.id,
          artistId,
          refresh_token: target.session.refresh_token,
          ...liveSession(),
        },
        data: {
          access_token: this.token.hashToken(access),
          refresh_token: this.token.hashToken(refresh),
          expiresAt: this.token.getRefreshTokenExpiresAt(),
          ...sessionActivity(client),
        },
      })
      if (changed.count !== 1) throw new NotFoundException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
      return { access, refresh }
    })
  }

  async remove(currentArtistId: string, raw: string | undefined, artistId: string) {
    if (artistId === currentArtistId)
      throw new ConflictException(ARTIST_AUTH_ERRORS.SESSION_IS_CURRENT)
    const hash = this.hash(raw)
    if (!hash) throw new NotFoundException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
    await this.prisma.$transaction(async (tx) => {
      await this.lock(tx, hash)
      const link = await tx.artistAccountLink.findUnique({
        where: { browserTokenHash_artistId: { browserTokenHash: hash, artistId } },
        select: { sessionId: true },
      })
      if (!link) throw new NotFoundException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
      await tx.artistSession.deleteMany({ where: { id: link.sessionId, artistId } })
    })
  }

  private async lock(tx: Prisma.TransactionClient, hash: string) {
    await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${hash}, 0))`)
    await tx.artistAccountLink.deleteMany({
      where: {
        browserTokenHash: hash,
        OR: [
          { session: { expiresAt: { lte: new Date() } } },
          { session: { artist: { deletedAt: { not: null } } } },
        ],
      },
    })
  }

  private async rememberCurrent(
    tx: Prisma.TransactionClient,
    artistId: string,
    accessToken: string,
    browserTokenHash: string,
  ) {
    const session = await tx.artistSession.findFirst({
      where: { artistId, access_token: this.token.hashToken(accessToken), ...liveSession() },
      select: { id: true },
    })
    if (!session) throw new UnauthorizedException(ARTIST_AUTH_ERRORS.ACCOUNT_NOT_SAVED)
    const where = { browserTokenHash_artistId: { browserTokenHash, artistId } }
    const existing = await tx.artistAccountLink.findUnique({ where, select: { sessionId: true } })
    if (
      !existing &&
      (await tx.artistAccountLink.count({ where: { browserTokenHash } })) >= SAVED_ACCOUNT_LIMIT
    )
      throw new ConflictException(ARTIST_AUTH_ERRORS.ACCOUNT_LIMIT)
    await tx.artistAccountLink.upsert({
      where,
      create: { browserTokenHash, artistId, sessionId: session.id },
      update: { sessionId: session.id },
    })
  }
}
