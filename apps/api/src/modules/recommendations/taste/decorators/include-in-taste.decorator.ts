import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { EXCLUSION_KIND_PARAM, ID_PARAM } from './params'

export function IncludeInTasteSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a taste exclusion' }),
    EXCLUSION_KIND_PARAM,
    ID_PARAM,
    ApiResponse({ status: 204, description: 'Used for the taste profile again (idempotent)' }),
  )
}
