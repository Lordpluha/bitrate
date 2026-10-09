import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger'
import { ReleaseDraftVersionDto } from '../dtos/release-media.dto'
import {
  ReleaseCoverUpdatedEntity,
  ReleaseTrackRemovedEntity,
  ReleaseTrackUploadedEntity,
} from '../entities/release-media.entity'

const expectedUpdatedAtProperty = {
  type: 'string',
  format: 'date-time',
  description: 'Release version read before editing',
} as const

const draftWriteResponses = [
  ApiParam({ name: 'id', format: 'uuid' }),
  ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release unavailable to this artist' }),
  ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Release changed since it was read or is no longer a draft',
  }),
]

const trackParam = ApiParam({ name: 'trackId', format: 'uuid' })

export function UploadReleaseCoverSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload the artwork of an owned draft',
      description:
        'Replaces the cover with a JPEG, PNG or WebP image up to 20 MB. The content is checked against the declared type. The previous uploaded cover is deleted after the change is saved.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['cover', 'expectedUpdatedAt'],
        properties: {
          cover: { type: 'string', format: 'binary' },
          expectedUpdatedAt: expectedUpdatedAtProperty,
        },
      },
    }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseCoverUpdatedEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Missing, oversized or invalid image',
    }),
    ...draftWriteResponses,
  )
}

export function RemoveReleaseCoverSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove the artwork of an owned draft' }),
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseCoverUpdatedEntity }),
    ...draftWriteResponses,
  )
}

export function UploadReleaseTrackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a recording to an owned draft from a master file',
      description:
        'Stores a WAV, FLAC, MP3 or OGG master up to 512 MB privately and creates the recording. Nothing is published or delivered. Clears the accuracy confirmation.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['audio', 'title', 'expectedUpdatedAt'],
        properties: {
          audio: { type: 'string', format: 'binary' },
          title: { type: 'string', minLength: 1, maxLength: 255 },
          expectedUpdatedAt: expectedUpdatedAtProperty,
        },
      },
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseTrackUploadedEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Missing, oversized or unsupported audio, or an invalid title',
    }),
    ...draftWriteResponses,
  )
}

export function ReplaceReleaseTrackAudioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace the master of a recording on an owned draft',
      description:
        'Attaches a new master to an existing recording, for example one created without audio. The previous master is deleted after the change is saved. Clears the accuracy confirmation.',
    }),
    trackParam,
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['audio', 'expectedUpdatedAt'],
        properties: {
          audio: { type: 'string', format: 'binary' },
          expectedUpdatedAt: expectedUpdatedAtProperty,
        },
      },
    }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTrackUploadedEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Missing or unsupported audio' }),
    ...draftWriteResponses,
  )
}

export function RemoveReleaseTrackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a recording from an owned draft',
      description:
        'Deletes the private master and frees the ISRC. Clears the accuracy confirmation.',
    }),
    trackParam,
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTrackRemovedEntity }),
    ...draftWriteResponses,
  )
}

export function ReleaseTrackAudioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Play the uploaded master of an owned recording',
      description: 'Private to the owner; supports HTTP Range for seeking.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    trackParam,
    ApiProduces('audio/*'),
    ApiResponse({ status: HttpStatus.OK, description: 'Audio bytes' }),
    ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Requested byte range' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'No uploaded audio for this recording',
    }),
  )
}
