import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ID_PARAM, NOT_INTERESTED_KIND_PARAM } from './params'

export function UnmarkNotInterestedSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Undo "Not interested"' }),
    NOT_INTERESTED_KIND_PARAM,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Recommendable again (idempotent)' }),
  )
}
