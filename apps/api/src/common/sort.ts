import { z } from 'zod'

/** The two directions a sortable list endpoint accepts. */
export type SortOrder = 'asc' | 'desc'

const sortOrderSchema = z.enum(['asc', 'desc'])

/**
 * Builds the `sort`/`order` query pair for a sortable list endpoint. `fields` is the
 * resource's explicit allowlist — the security boundary, not a convenience: zod rejects any
 * value outside it with a 400 before a service ever sees it, so a caller-supplied string can
 * never be interpolated into SQL or used as an arbitrary Prisma `orderBy` key.
 *
 * ```ts
 * export const ListAdminUsersQuerySchema = paginationQuerySchema
 *   .merge(sortQuerySchema(['username', 'email', 'createdAt']))
 *   .extend({ q: z.string().optional() })
 * ```
 *
 * Deliberately no `.default()` on either field, for the same reason `paginationQuerySchema`
 * has none: a default would publish itself into the OpenAPI spec and change the generated
 * contract, while the service layer already falls back to each resource's existing order.
 */
export function sortQuerySchema<const Fields extends readonly [string, ...string[]]>(
  fields: Fields,
) {
  return z.object({
    sort: z.enum(fields).optional(),
    order: sortOrderSchema.optional(),
  })
}

/** Input shared by every sortable list service — the two fields `sortQuerySchema` produces. */
export type SortInput<Field extends string> = { sort?: Field; order?: SortOrder }

/**
 * Resolves the Prisma `orderBy` array for a sortable list. Absent `sort`, `fallback` is
 * returned unchanged — today's ordering, byte for byte. Present, orders by the chosen field
 * and appends `id` as a stable tie-break in the same direction, so paging through equal
 * values never repeats or skips a row.
 *
 * `OrderBy` is the resource's Prisma `orderBy` input (pass it explicitly, e.g.
 * `buildSortOrderBy<Prisma.UserOrderByWithRelationInput>(…)`), so `sort` must be one of that
 * model's own keys and the result drops straight into `findMany` without a cast at the call site.
 */
export function buildSortOrderBy<OrderBy extends { id?: unknown }>(
  { sort, order = 'asc' }: SortInput<string & keyof OrderBy>,
  fallback: OrderBy[],
): OrderBy[] {
  if (!sort) return fallback
  // Keep property names literal even when this helper is called without DTO validation.
  // The endpoint schemas further restrict which of these fields each resource accepts.
  let primary: Record<string, SortOrder>
  switch (sort) {
    case 'username':
      primary = { username: order }
      break
    case 'email':
      primary = { email: order }
      break
    case 'createdAt':
      primary = { createdAt: order }
      break
    case 'title':
      primary = { title: order }
      break
    case 'name':
      primary = { name: order }
      break
    case 'slug':
      primary = { slug: order }
      break
    case 'processingStatus':
      primary = { processingStatus: order }
      break
    case 'releaseDate':
      primary = { releaseDate: order }
      break
    case 'monthlyListeners':
      primary = { monthlyListeners: order }
      break
    case 'status':
      primary = { status: order }
      break
    default:
      throw new Error('Unsupported sort field')
  }
  // Sound: `sort` is a key of `OrderBy` and the switch emits only that key, with a sort order.
  return [primary, { id: order }] as OrderBy[]
}
