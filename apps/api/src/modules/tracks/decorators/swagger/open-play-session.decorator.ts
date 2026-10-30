import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { OpenPlaySessionDto } from '../../dtos/open-play-session.dto'
import { PlaySessionEntity } from '../../entities'

/** Swagger for `POST /tracks/:id/play-sessions`. */
export function OpenPlaySessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Open a playback session for a track',
      description:
        'Returns the byte-range manifest and a signed token. Every rendition request must ' +
        'carry it as `?t=`; it lasts the track plus 15 minutes and is revoked on logout and ' +
        'password reset. See ADR-0067.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiBody({ type: OpenPlaySessionDto, required: false }),
    ApiResponse({ status: HttpStatus.CREATED, type: PlaySessionEntity }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not signed in' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track not found or has no CMAF renditions',
    }),
    ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Too many sessions opened' }),
  )
}
