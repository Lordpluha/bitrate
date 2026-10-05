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
import { AdminPodcastEntity } from '../../entities'

/** Runs the delete podcast swagger operation. */
export function DeletePodcastSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPodcastEntity),
    ApiOperation({
      summary: 'Soft-delete (take down) a podcast',
      description: "The podcast's episodes are not affected and stay independently manageable.",
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminPodcastEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Podcast not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Podcast is already deleted' }),
  )
}
