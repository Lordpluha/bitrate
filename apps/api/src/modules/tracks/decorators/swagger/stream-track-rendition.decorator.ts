import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the stream track rendition swagger operation. */
export function StreamTrackRenditionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream bytes of one CMAF rendition',
      description:
        'Serves the rendition file, honoring an inclusive `bytes=` Range. The player asks ' +
        'for one fragment at a time using offsets from the manifest.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiParam({ name: 'bitrate', type: 'integer', example: 192, description: 'Rendition kbps' }),
    ApiHeader({
      name: 'Range',
      required: false,
      description: 'Inclusive byte window, e.g. `bytes=929-100915`',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Whole rendition file' }),
    ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Requested byte range' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rendition not found' }),
  )
}
