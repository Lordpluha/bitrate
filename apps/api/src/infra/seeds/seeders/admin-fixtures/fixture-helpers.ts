/**
 * Re-run semantics shared by every fixture row keyed on a natural key (email, isrc, slug, …):
 * a re-run must never resurrect a row an operator manually deactivated through the panel, and
 * never re-stamp a fresh deactivation timestamp on a row this seeder already deactivated once.
 *
 * `intendedDeletedAt` is the fixture's own opinion (a fixed `Date` for a fixture that should be
 * deactivated, or `null` for one that should stay active). `existingDeletedAt` is whatever is
 * actually on the row right now, from before this update.
 *
 * @returns the value to write back for a *deactivating* fixture; `undefined` when the fixture
 * itself does not intend deactivation, meaning the caller should omit `deletedAt` from its
 * update payload entirely and leave the row's current state — including a manual deactivation —
 * untouched.
 */
export function resolveDeletedAtForUpdate(
  existingDeletedAt: Date | null,
  intendedDeletedAt: Date | null,
): Date | undefined {
  if (!intendedDeletedAt) return undefined
  return existingDeletedAt ?? intendedDeletedAt
}
