import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { ArtistAuthRequest } from '../types'

/** Extracts the authenticated artist `ArtistsAuthGuard` attached to the request. */
export const CurrentArtist = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<Request & ArtistAuthRequest>().artist,
)
