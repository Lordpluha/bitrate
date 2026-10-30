import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Swagger for `GET /tracks/:id/cmaf/:bitrate`. */
export function StreamTrackRenditionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream a CMAF rendition for a playback session',
      description:
        'Serves bytes for a playback session (`?t=` from `POST /tracks/:id/play-sessions`). ' +
        'A `Range` of at most the largest fragment (~10 s) is served exactly; a missing or ' +
        'longer range gets one response to the end of the file, released no faster than the ' +
        'session budget: real time since it opened plus 60 s of audio. See ADR-0067.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiParam({ name: 'bitrate', type: 'integer', example: 192, description: 'Rendition kbps' }),
    ApiQuery({ name: 't', required: true, description: 'Playback session token' }),
    ApiHeader({
      name: 'Range',
      required: false,
      description: 'Inclusive byte window, e.g. `bytes=929-100915`',
    }),
    ApiResponse({
      status: HttpStatus.PARTIAL_CONTENT,
      description: 'The requested fragment, or the rest of the file at real-time pace',
      content: { 'audio/mp4': { schema: { type: 'string', format: 'binary' } } },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Missing, forged, expired, revoked or other-track session token',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rendition not found' }),
    ApiResponse({
      status: HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
      description: 'Range outside the file',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'The session is ahead of real time; retry after `Retry-After` seconds',
    }),
  )
}
