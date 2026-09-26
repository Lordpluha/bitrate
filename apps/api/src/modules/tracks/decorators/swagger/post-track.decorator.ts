import { CreateTrackDto } from '@modules/tracks/dtos/create-track.dto'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TrackEntity } from '../../entities'

/** Runs the post track swagger operation. */
export function PostTrackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create track' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: CreateTrackDto,
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      type: TrackEntity,
    }),
  )
}
