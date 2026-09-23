import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Get the caller's home feed: recommended tracks, new releases, popular playlists, and on-repeat. */
export function GetFeedSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the home feed',
      description:
        'Anonymous callers get genre-agnostic sections. An authenticated caller gets tracks weighted toward their most-listened genres, plus an "On Repeat" section built from their own recent top tracks.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'An ordered list of feed sections' }),
  )
}
