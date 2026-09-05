import type { Type } from '@nestjs/common'
import { getSchemaPath } from '@nestjs/swagger'

/** Builds the OpenAPI schema shared by the API's offset-paginated endpoints. */
export const paginatedResponseSchema = (itemType: Type<unknown>) => ({
  type: 'object',
  required: ['data', 'total', 'page', 'limit'],
  properties: {
    data: {
      type: 'array',
      items: { $ref: getSchemaPath(itemType) },
    },
    total: { type: 'integer', minimum: 0 },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1 },
  },
})
