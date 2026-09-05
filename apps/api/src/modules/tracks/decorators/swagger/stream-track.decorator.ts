import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the stream track swagger operation. */
export function StreamTrackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream audio file',
      description:
        'Returns the track audio as a binary stream. Supports HTTP range requests for partial content.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiHeader({
      name: 'Range',
      required: false,
      description: 'Byte range for partial content (e.g. bytes=0-1048575)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Full audio stream',
      content: { 'audio/mpeg': { schema: { type: 'string', format: 'binary' } } },
    }),
    ApiResponse({
      status: HttpStatus.PARTIAL_CONTENT,
      description: 'Partial audio stream (Range request)',
      content: { 'audio/mpeg': { schema: { type: 'string', format: 'binary' } } },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
