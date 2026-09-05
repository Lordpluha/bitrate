import { z } from 'zod'

/**
 * Accepts either a bare array or the API's paginated envelope and always
 * yields the array.
 *
 * The API moved list endpoints to `{ data, total, page, limit }` while the
 * client schemas still expected a bare array. Zod then rejected the response,
 * the query surfaced "expected array, received object", and the screen relying
 * on it — the library, most visibly — rendered empty. Tolerating both shapes
 * keeps the client working across that transition.
 */
export const arrayOrPaginated = <TItem extends z.ZodTypeAny>(item: TItem) =>
  z
    .union([z.array(item), z.object({ data: z.array(item) })])
    .transform((value) => (Array.isArray(value) ? value : value.data))
