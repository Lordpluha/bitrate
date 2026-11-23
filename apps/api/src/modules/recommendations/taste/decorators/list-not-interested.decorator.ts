import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { NotInterestedItemEntity } from '../entities/not-interested-item.entity'
import { PAGE_QUERIES } from './params'

export function ListNotInterestedSwagger() {
  return applyDecorators(
    ApiExtraModels(NotInterestedItemEntity),
    ApiOperation({ summary: 'List items marked "Not interested", newest first' }),
    ...PAGE_QUERIES,
    ApiResponse({ status: 200, schema: paginatedResponseSchema(NotInterestedItemEntity) }),
  )
}
