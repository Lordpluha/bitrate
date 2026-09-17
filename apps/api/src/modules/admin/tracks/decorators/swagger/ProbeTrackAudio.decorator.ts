import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the probe track audio swagger operation. */
export function ProbeTrackAudioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Probe a READY track's CMAF audio headers",
      description:
        'Confirms the session is live and the rendition is playable — headers only, no body, ' +
        'no storage round-trip.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiQuery({
      name: 'bitrate',
      required: false,
      type: Number,
      description: 'Rendition kbps; defaults to the highest available CMAF rendition',
    }),
    ApiProduces('audio/mp4'),
    ApiResponse({ status: HttpStatus.OK, description: 'Rendition headers' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track missing, not READY, or has no CMAF rendition at the requested bitrate',
    }),
  )
}
