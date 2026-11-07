import { CreateTrackDto } from '@modules/tracks/dtos/create-track.dto'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the post track swagger operation. */
export function PostTrackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Direct artist track uploads are disabled',
      description:
        'Upload recordings to an owned release draft and submit the release for Bitrate review. This legacy endpoint always returns 403 for authenticated artists, without processing uploaded files.',
      deprecated: true,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: CreateTrackDto,
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Use the reviewed release workflow',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated as artist' }),
  )
}
