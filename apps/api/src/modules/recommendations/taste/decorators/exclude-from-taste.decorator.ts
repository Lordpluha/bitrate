import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { EXCLUSION_KIND_PARAM, ID_PARAM } from './params'

export function ExcludeFromTasteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '"Don\'t use for my taste": exclude a playlist, an album or a track',
      description: 'Also covers past plays, and is undone by removing the exclusion.',
    }),
    EXCLUSION_KIND_PARAM,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Excluded (idempotent)' }),
    ApiResponse({
      status: 404,
      description: 'No such item, or a private playlist of someone else',
    }),
  )
}
