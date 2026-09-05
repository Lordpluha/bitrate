import { BadRequestException } from '@nestjs/common'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

/** Page-based pagination request shared by every paginated list endpoint. */
export type PaginationInput = { page?: number; limit?: number }

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

export function normalizePagination(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  if (!Number.isInteger(page) || page < 1) {
    throw new BadRequestException('Page must be a positive integer')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new BadRequestException(`Limit must be between 1 and ${MAX_LIMIT}`)
  }

  return { page, limit, skip: (page - 1) * limit }
}
