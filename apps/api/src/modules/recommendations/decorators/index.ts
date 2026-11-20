import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { NOT_INTERESTED_KINDS, RecordPlaybackEventDto, TASTE_EXCLUSION_KINDS } from '../dtos'
import {
  NotInterestedItemEntity,
  PlaybackEventRecordedEntity,
  TasteExclusionItemEntity,
} from '../entities'

const ID_PARAM = ApiParam({ name: 'id', type: 'string', format: 'uuid' })
const PAGE_QUERIES = [
  ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
  ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
]
const notInterestedKind = ApiParam({ name: 'kind', enum: Object.keys(NOT_INTERESTED_KINDS) })
const exclusionKind = ApiParam({ name: 'kind', enum: Object.keys(TASTE_EXCLUSION_KINDS) })

export function RecordPlaybackEventSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Report a finished play',
      description:
        'Sent when a play ends, is skipped or is replaced. Feeds recommendations only; listening ' +
        'history is still recorded when the play starts. Nothing is stored during a private session.',
    }),
    ApiBody({ type: RecordPlaybackEventDto }),
    ApiResponse({ status: 200, description: 'Accepted', type: PlaybackEventRecordedEntity }),
    ApiResponse({
      status: 400,
      description: 'Invalid event, or reported too late or ahead of time',
    }),
    ApiResponse({ status: 404, description: 'The track is not in the catalogue' }),
  )
}

export function ListNotInterestedSwagger() {
  return applyDecorators(
    ApiExtraModels(NotInterestedItemEntity),
    ApiOperation({ summary: 'List items marked "Not interested", newest first' }),
    ...PAGE_QUERIES,
    ApiResponse({ status: 200, schema: paginatedResponseSchema(NotInterestedItemEntity) }),
  )
}

export function MarkNotInterestedSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a track or an artist "Not interested"' }),
    notInterestedKind,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Hidden from recommendations (idempotent)' }),
    ApiResponse({ status: 404, description: 'No such track or artist' }),
  )
}

export function UnmarkNotInterestedSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Undo "Not interested"' }),
    notInterestedKind,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Recommendable again (idempotent)' }),
  )
}

export function ListTasteExclusionsSwagger() {
  return applyDecorators(
    ApiExtraModels(TasteExclusionItemEntity),
    ApiOperation({ summary: 'List items excluded from the taste profile, newest first' }),
    ...PAGE_QUERIES,
    ApiResponse({ status: 200, schema: paginatedResponseSchema(TasteExclusionItemEntity) }),
  )
}

export function ExcludeFromTasteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '"Don\'t use for my taste": exclude a playlist, an album or a track',
      description: 'Also covers past plays, and is undone by removing the exclusion.',
    }),
    exclusionKind,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Excluded (idempotent)' }),
    ApiResponse({
      status: 404,
      description: 'No such item, or a private playlist of someone else',
    }),
  )
}

export function IncludeInTasteSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a taste exclusion' }),
    exclusionKind,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Used for the taste profile again (idempotent)' }),
  )
}
