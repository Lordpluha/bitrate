import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import {
  ArtistReleaseChangeListEntity,
  ReleaseChangeRequestEntity,
} from '../entities/release-change.entity'

const releaseParam = ApiParam({ name: 'id', format: 'uuid' })
const notFound = ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Release unavailable to this artist',
})

export function ListReleaseChangesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List proposed changes of an owned release',
      description:
        'Every pending change plus the latest approved or rejected change for each title, cover and recording.',
    }),
    releaseParam,
    ApiResponse({ status: HttpStatus.OK, type: ArtistReleaseChangeListEntity }),
    notFound,
  )
}

export function SubmitReleaseChangesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Propose changes to a published release',
      description:
        'Sends a new release title, cover and recording titles for review. The release stays live with its current data until staff approve each change. Only RELEASED releases and ones the artist took offline accept changes; one change per title, cover or recording may be pending.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          recordings: {
            type: 'string',
            description: 'JSON array of { id, title } for recordings first published here',
            example: '[{"id":"0199aee0-0000-7000-8000-0000000000d1","title":"Night drive"}]',
          },
          cover: { type: 'string', format: 'binary', description: 'JPEG, PNG or WebP up to 20 MB' },
        },
      },
    }),
    releaseParam,
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseChangeRequestEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'No change, invalid fields or an invalid image',
    }),
    notFound,
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Release does not accept changes, a value is unchanged, a recording is locked or a change is already pending',
    }),
  )
}

export function WithdrawReleaseChangesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Withdraw the pending changes of a request',
      description: 'Changes staff already decided keep their outcome.',
    }),
    releaseParam,
    ApiParam({ name: 'requestId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseChangeRequestEntity }),
    notFound,
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nothing left to withdraw' }),
  )
}
