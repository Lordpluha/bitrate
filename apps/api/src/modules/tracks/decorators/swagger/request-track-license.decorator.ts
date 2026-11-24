import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { TrackLicenseRequestDto } from '../../dtos/track-license-request.dto'

/** Swagger for `POST /tracks/:id/license`. */
export function RequestTrackLicenseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the ClearKey licence of an encrypted track for a playback session',
      description:
        'Answers the W3C ClearKey licence request a CDM emits for an encrypted rendition with ' +
        "the track's content key as a JSON Web Key set. Requires the live session's token " +
        '(`?t=`), so revocation and listener limits apply to keys as to bytes. Never cached. ' +
        'See ADR-0077.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiQuery({ name: 't', required: true, description: 'Playback session token' }),
    ApiBody({ type: TrackLicenseRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'ClearKey licence',
      schema: {
        type: 'object',
        required: ['keys', 'type'],
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'object',
              required: ['kty', 'kid', 'k'],
              properties: {
                kty: { type: 'string', enum: ['oct'] },
                kid: { type: 'string', description: 'Key id, base64url' },
                k: { type: 'string', description: 'Content key, base64url' },
              },
            },
          },
          type: { type: 'string', enum: ['temporary'] },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Malformed licence request' }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Missing, forged, expired, revoked or other-track session token',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'The track is not encrypted, or the request names another key id',
    }),
    ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Keys unavailable' }),
    ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Too many requests' }),
  )
}
