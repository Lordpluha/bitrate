import { BadRequestException } from '@nestjs/common'
import { z } from 'zod'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

/** Page-based pagination request shared by every paginated list endpoint. */
export type PaginationInput = { page?: number; limit?: number }

/**
 * The query half of that request, as a zod schema, for the endpoints whose DTOs are built with
 * `createZodDto`. Extend it rather than restating the two fields:
 *
 * ```ts
 * export const ListAdminUsersQuerySchema = paginationQuerySchema.extend({ q: z.string().optional() })
 * ```
 *
 * `z.coerce` is required because query strings arrive as strings, and the bounds come from the
 * constants above so `MAX_LIMIT` stays one number rather than one per resource. Deliberately no
 * `.default()`: that would publish a default into the OpenAPI spec and change the generated
 * contract, while the service layer already supplies `DEFAULT_PAGE`/`DEFAULT_LIMIT`.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
})

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
