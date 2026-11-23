import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import {
  DecideReleaseChangesDto,
  RELEASE_CHANGE_QUEUE_STATUSES,
} from '../dtos/release-change-review.dto'
import {
  AdminReleaseChangeRequestEntity,
  AdminReleaseChangeStatsEntity,
  PaginatedAdminReleaseChangeRequestsEntity,
} from '../entities/admin-release-change.entity'

const idParam = ApiParam({ name: 'id', format: 'uuid' })
const notFound = ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Request not found' })

export function ListReleaseChangeRequestsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List change requests for published releases',
      description:
        'OPEN (default) lists requests with pending changes, oldest first; CLOSED lists decided ones, newest first. Requires releases:read.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: RELEASE_CHANGE_QUEUE_STATUSES }),
    ApiResponse({ status: HttpStatus.OK, type: PaginatedAdminReleaseChangeRequestsEntity }),
  )
}

export function ReleaseChangeStatsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Count open change requests', description: 'Requires releases:read.' }),
    ApiResponse({ status: HttpStatus.OK, type: AdminReleaseChangeStatsEntity }),
  )
}

export function GetReleaseChangeRequestSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Read a change request with each change as before and after',
      description: 'A pending proposed cover is a short-lived signed link. Requires releases:read.',
    }),
    idParam,
    ApiResponse({ status: HttpStatus.OK, type: AdminReleaseChangeRequestEntity }),
    notFound,
  )
}

export function DecideReleaseChangesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve or reject pending changes of a request',
      description:
        'Each change is decided on its own; approval updates the release, its album and its catalogue tracks. A rejection requires a Markdown reason. The request closes when nothing is pending. Requires releases:review.',
    }),
    idParam,
    ApiBody({ type: DecideReleaseChangesDto }),
    ApiResponse({ status: HttpStatus.OK, type: AdminReleaseChangeRequestEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid decisions' }),
    notFound,
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A change is no longer pending or the release no longer takes changes',
    }),
  )
}
