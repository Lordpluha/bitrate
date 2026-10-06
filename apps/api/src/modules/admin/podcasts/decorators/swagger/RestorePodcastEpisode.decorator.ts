import { TakeDownReasonDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { AdminPodcastEpisodeEntity } from '../../entities'

/** Runs the restore podcast episode swagger operation. */
export function RestorePodcastEpisodeSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPodcastEpisodeEntity),
    ApiOperation({ summary: 'Restore a previously taken-down episode of a podcast' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiParam({ name: 'episodeId', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminPodcastEpisodeEntity) },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Episode not found on this podcast',
    }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Episode is not deleted' }),
  )
}
