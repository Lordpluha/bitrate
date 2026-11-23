import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ID_PARAM, NOT_INTERESTED_KIND_PARAM } from './params'

export function MarkNotInterestedSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a track or an artist "Not interested"' }),
    NOT_INTERESTED_KIND_PARAM,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Hidden from recommendations (idempotent)' }),
    ApiResponse({ status: 404, description: 'No such track or artist' }),
  )
}
