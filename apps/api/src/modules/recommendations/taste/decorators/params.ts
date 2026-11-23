import { ApiParam, ApiQuery } from '@nestjs/swagger'
import { NOT_INTERESTED_KINDS, TASTE_EXCLUSION_KINDS } from '../taste-params'

/** Path and query parameters the taste endpoints share. */
export const ID_PARAM = ApiParam({ name: 'id', type: 'string', format: 'uuid' })
export const PAGE_QUERIES = [
  ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
  ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
]
export const NOT_INTERESTED_KIND_PARAM = ApiParam({
  name: 'kind',
  enum: Object.keys(NOT_INTERESTED_KINDS),
})
export const EXCLUSION_KIND_PARAM = ApiParam({
  name: 'kind',
  enum: Object.keys(TASTE_EXCLUSION_KINDS),
})
