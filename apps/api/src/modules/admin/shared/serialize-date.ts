/** Serialises a nullable `Date` for an audit row's JSON `before`/`after` snapshot. */
export function isoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null
}
