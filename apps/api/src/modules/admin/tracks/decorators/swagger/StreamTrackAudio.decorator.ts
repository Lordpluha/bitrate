import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'

/** Runs the stream track audio swagger operation. */
export function StreamTrackAudioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Stream a READY track's CMAF audio for operator playback",
      description:
        'Serves the highest-bitrate CMAF rendition by default, or the one named by `bitrate`, ' +
        'honoring an inclusive `bytes=` Range. Playable even for a taken-down track, so an ' +
        'operator can review it before deciding whether to restore it.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiQuery({
      name: 'bitrate',
      required: false,
      type: Number,
      description: 'Rendition kbps; defaults to the highest available CMAF rendition',
    }),
    ApiHeader({
      name: 'Range',
      required: false,
      description: 'Inclusive byte window, e.g. `bytes=929-100915`',
    }),
    ApiProduces('audio/mp4'),
    ApiResponse({ status: HttpStatus.OK, description: 'Whole rendition file' }),
    ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Requested byte range' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track missing, not READY, or has no CMAF rendition at the requested bitrate',
    }),
    ApiResponse({
      status: HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
      description: 'Requested byte range is not satisfiable',
    }),
  )
}
