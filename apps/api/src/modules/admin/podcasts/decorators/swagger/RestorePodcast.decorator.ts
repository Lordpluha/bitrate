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

/** Runs the restore podcast swagger operation. */
export function RestorePodcastSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPodcastEntity),
    ApiOperation({ summary: 'Restore a previously taken-down podcast' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminPodcastEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Podcast not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Podcast is not deleted' }),
  )
}
