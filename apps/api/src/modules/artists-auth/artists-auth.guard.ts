import {
  SessionAuthGuard,
  type SessionTokenHashes,
  sessionAuth,
  type TokenRequirement,
} from '@modules/auth-core'
import { Injectable } from '@nestjs/common'
import type { Artist } from '@prisma/client'
import type { Request } from 'express'

export type { TokenRequirement } from '@modules/auth-core'

/**
 * Metadata wrapper to control AuthGuard behavior.
 * @param tokenRequirement
 * @returns Decorator function that sets the token requirement for the guard.
 */
export function ArtistAuth(tokenRequirement: TokenRequirement = 'access') {
  return sessionAuth(ArtistAuthGuard, tokenRequirement)
}

/** Represents the artist auth guard. */
@Injectable()
export class ArtistAuthGuard extends SessionAuthGuard<Artist> {
  protected readonly audience = 'artist' as const

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
