import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Serves the HLS master playlist for a track's default (Opus) rendition set. */
export function GetHlsMasterPlaylistSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the HLS master playlist for a track',
      description:
        'Returns `application/vnd.apple.mpegurl`, listing every available bitrate variant.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'The master playlist' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track not found, or its HLS stream is not ready',
    }),
  )
}
