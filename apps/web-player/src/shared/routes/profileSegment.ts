/** Users and artists have UUID primary keys (`uuid(7)` in the Prisma schema). */
const ENTITY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Whether a profile URL segment has the shape of an account id rather than a username —
 * the form profile links took before they moved to usernames.
 */
export const isEntityIdSegment = (segment: string) =>
  ENTITY_ID_PATTERN.test(segment)

/**
 * The value of a dynamic route segment. Next.js hands `params` to pages URL-encoded, so a
 * username such as `Luma Vale` arrives as `Luma%20Vale`.
 */
export const decodeRouteSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment)
  } catch {
    /* a malformed escape (a lone `%`) is taken literally */
    return segment
  }
}
