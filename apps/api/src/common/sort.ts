import { z } from 'zod'

/** The two directions a sortable list endpoint accepts. */
export type SortOrder = 'asc' | 'desc'

export const sortOrderSchema = z.enum(['asc', 'desc'])

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
 * The return type is intentionally the widened `Record<string, SortOrder>[]` rather than a
 * specific `Prisma.<Model>OrderByWithRelationInput[]` — one helper serves every resource.
 * Callers assert the precise Prisma type at the call site; that's safe because `Field` is
 * already constrained to the resource's own zod-validated allowlist.
 */
export function buildSortOrderBy<Field extends string>(
  { sort, order = 'asc' }: SortInput<Field>,
  fallback: readonly Record<string, SortOrder>[],
): readonly Record<string, SortOrder>[] {
  if (!sort) return fallback
  return [{ [sort]: order }, { id: order }]
}
