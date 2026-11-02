import { ReleaseEntity } from '@modules/releases/entities/release.entity'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import {
  ADMIN_RELEASE_STATUSES,
  ApproveReleaseDto,
  RequestReleaseChangesDto,
} from '../dtos/release-review.dto'
import {
  AdminReleaseDecisionEntity,
  AdminReleaseDetailEntity,
  PaginatedAdminReleasesEntity,
} from '../entities/admin-release.entity'

const idParam = ApiParam({ name: 'id', format: 'uuid' })
const decisionResponses = [
  idParam,
  ApiResponse({ status: HttpStatus.OK, type: AdminReleaseDecisionEntity }),
  ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release not found' }),
  ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Release changed since it was read or is no longer awaiting review',
  }),
]

export function ListAdminReleasesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List releases for Bitrate review',
      description: 'Defaults to SUBMITTED, oldest submission first. Requires releases:read.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RELEASE_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Title or artist handle' }),
    ApiResponse({ status: HttpStatus.OK, type: PaginatedAdminReleasesEntity }),
  )
}

export function GetAdminReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Read a release under review with its tracks, rights, plan and review history',
    }),
    idParam,
    ApiResponse({ status: HttpStatus.OK, type: AdminReleaseDetailEntity }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release not found or still a draft',
    }),
  )
}

export function ApproveReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve a submitted release',
      description:
        'SUBMITTED -> READY. Recorded in the review history and audit log. Requires releases:review.',
    }),
    ApiBody({ type: ApproveReleaseDto }),
    ...decisionResponses,
  )
}

export function RetryReleasePublishingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Retry publishing a release',
      description:
        'PUBLISH_FAILED -> PUBLISHING. Converted tracks are kept; failed ones are converted again. Recorded in the audit log. Requires releases:review.',
    }),
    idParam,
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed or its publishing has not failed',
    }),
  )
}

export function TakeDownReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Take a release offline on Bitrate',
      description:
        'RELEASED or artist-hidden UNPUBLISHED -> UNPUBLISHED by Bitrate (moderation, rights claims). The artist cannot publish it again. Recorded in the audit log. Requires releases:review.',
    }),
    idParam,
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed or is not live on Bitrate',
    }),
  )
}

export function RequestReleaseChangesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request changes to a submitted release',
      description:
        'SUBMITTED -> REJECTED with Markdown feedback on what to change; the artist revises and resubmits. Requires releases:review.',
    }),
    ApiBody({ type: RequestReleaseChangesDto }),
    ...decisionResponses,
  )
}

export function AdminReleaseAudioSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Play the submitted master of a recording' }),
    idParam,
    ApiParam({ name: 'trackId', format: 'uuid' }),
    ApiProduces('audio/*'),
    ApiResponse({ status: HttpStatus.OK, description: 'Audio bytes' }),
    ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Requested byte range' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No uploaded audio' }),
  )
}
