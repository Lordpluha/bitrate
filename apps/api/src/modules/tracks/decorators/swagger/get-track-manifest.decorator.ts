import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the get track manifest swagger operation. */
export function GetTrackManifestSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the byte-range playback manifest for a track',
      description:
        'Returns the fragment index every CMAF rendition is addressed by. Immutable for a ' +
        'given track, so it can be cached indefinitely. See ADR-0020.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: '#/components/schemas/TrackManifestEntity' },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track not found or has no CMAF renditions',
    }),
  )
}
