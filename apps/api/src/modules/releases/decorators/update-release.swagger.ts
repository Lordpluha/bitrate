import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ReleaseDraftVersionDto } from '../dtos/release-media.dto'
import { UpdateReleaseDto } from '../dtos/update-release.dto'
import { ReleaseEntity } from '../entities/release.entity'

export function DeleteReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an owned release',
      description:
        'Removes an owned release in any lifecycle state, its recording associations and published album. Shared recordings used by other releases stay available; identifiers of unshared recordings become available again. Scheduled and in-flight publishing jobs cannot restore deleted releases. Requires the previously read updatedAt version; concurrent changes return 409.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Release deleted' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Missing version or invalid release ID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read',
    }),
  )
}

export function UpdateReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit an owned release draft',
      description:
        'Updates title, UPC and/or the release timing. Type is detected automatically from active recordings (0–4 SINGLE, 5–6 EP, 7+ ALBUM); a supplied type is ignored. Title and UPC change only in DRAFT; a request changing only the timing (scheduledAt) is also accepted after approval (READY). Requires the previously read updatedAt version; concurrent changes return 409. Saving a timing does not submit or deliver a release.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: UpdateReleaseDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid draft fields or release ID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read or is no longer a draft',
    }),
  )
}
