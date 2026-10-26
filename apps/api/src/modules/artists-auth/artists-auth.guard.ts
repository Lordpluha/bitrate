import { PrismaService } from '@infra/prisma/prisma.service'
import {
  SessionAuthGuard,
  type SessionTokenHashes,
  sessionAuth,
  type TokenRequirement,
} from '@modules/auth-core'
import { TokenService } from '@modules/tokens/token.service'
import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Artist } from '@prisma/client'
import type { Request } from 'express'

export type { TokenRequirement } from '@modules/auth-core'

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function ArtistAuth(tokenRequirement: TokenRequirement = 'access') {
  return sessionAuth(ArtistAuthGuard, tokenRequirement, 'artist')
}

/** Represents the artist auth guard. */
@Injectable()
export class ArtistAuthGuard extends SessionAuthGuard<Artist> {
  protected readonly audience = 'artist' as const

  /** Declared for Nest's own `design:paramtypes`; see `UserAuthGuard`. */
  constructor(prisma: PrismaService, reflector: Reflector, tokenService: TokenService) {
    super(prisma, reflector, tokenService)
  }

  protected findAccount(id: string) {
    return this.prisma.artist.findFirst({ where: { id, deletedAt: null } })
  }

  protected findSession(artistId: string, tokens: SessionTokenHashes) {
    return this.prisma.artistSession.findFirst({
      where: { ...tokens, artistId, expiresAt: { gt: new Date() } },
    })
  }

  protected attach(request: Request, artist: Artist) {
    request.artist = artist
  }
}
