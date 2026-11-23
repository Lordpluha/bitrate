import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TasteExclusionItemEntity } from '../entities/taste-exclusion-item.entity'
import { PAGE_QUERIES } from './params'

export function ListTasteExclusionsSwagger() {
  return applyDecorators(
    ApiExtraModels(TasteExclusionItemEntity),
    ApiOperation({ summary: 'List items excluded from the taste profile, newest first' }),
    ...PAGE_QUERIES,
    ApiResponse({ status: 200, schema: paginatedResponseSchema(TasteExclusionItemEntity) }),
  )
}
