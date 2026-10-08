import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ReplaceReleaseSplitsDto } from '../dtos/replace-release-splits.dto'
import { SubmitReleaseDto, WithdrawReleaseDto } from '../dtos/submit-release.dto'
import { UpdateReleaseRightsDto } from '../dtos/update-release-rights.dto'
import { UpdateReleaseTrackDto } from '../dtos/update-release-track.dto'
import { ReleaseEntity } from '../entities/release.entity'
import { ReleaseSplitsEntity, ReleaseTrackUpdatedEntity } from '../entities/release-rights.entity'
import { ReleaseBlockerEntity } from '../entities/release-workspace.entity'

const draftWriteResponses = [
  ApiParam({ name: 'id', format: 'uuid' }),
  ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release unavailable to this artist' }),
  ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Release changed since it was read or is no longer a draft',
  }),
]

export function UpdateReleaseRightsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm the rights of an owned draft',
      description:
        'Replaces the master owner and both confirmations in one request, so each confirmation describes the saved owner. Changing credits later clears both confirmations; changing splits clears accuracy.',
    }),
    ApiBody({ type: UpdateReleaseRightsDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid owner or release ID' }),
    ...draftWriteResponses,
  )
}

export function ReplaceReleaseSplitsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace the splits of one right type on an owned draft',
      description:
        'Replaces every share of the given right type. Drafts may stay below 100% but never exceed it; submission requires exactly 100% for recording and composition. Clears the accuracy confirmation.',
    }),
    ApiBody({ type: ReplaceReleaseSplitsDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseSplitsEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid shares, a total above 100% or a contributor from another release',
    }),
    ...draftWriteResponses,
  )
}

export function UpdateReleaseTrackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Set the ISRC of a recording on an owned draft',
      description:
        'Accepts the code with or without hyphens and stores it compact. Optional for submission; a distributor can assign one later.',
    }),
    ApiParam({ name: 'trackId', format: 'uuid' }),
    ApiBody({ type: UpdateReleaseTrackDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTrackUpdatedEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ISRC or IDs' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release or recording unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed, is no longer a draft, or the ISRC is already used',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
  )
}

export function SubmitReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit an owned draft for Bitrate review',
      description:
        'Re-checks every blocker in the same transaction and moves DRAFT to SUBMITTED. Creates an internal review request only; it does not deliver the release to streaming services. Missing UPC/ISRC never blocks.',
    }),
    ApiBody({ type: SubmitReleaseDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Review not confirmed or invalid ID',
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'The draft has blockers; the body lists them',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          blockers: { type: 'array', items: { $ref: getSchemaPath(ReleaseBlockerEntity) } },
        },
      },
    }),
    ...draftWriteResponses,
  )
}

export function WithdrawReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Withdraw a submitted release back to its draft',
      description: 'Allowed while the release awaits Bitrate review; saved data is kept.',
    }),
    ApiBody({ type: WithdrawReleaseDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read or is not awaiting review',
    }),
  )
}
