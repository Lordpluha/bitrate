import type { AdminFixturesPrismaClient, AdminFixturesSummary } from './types'

/**
 * The one deactivated fixture album. Keyed on `(title, artistId)` since `Album` has no unique
 * natural key of its own; preserves an already-recorded `deletedAt` on re-run instead of
 * re-stamping a fresh one, the same rule {@link import('./fixture-helpers').resolveDeletedAtForUpdate}
 * applies elsewhere — inlined here since there is exactly one row and no "stays active" branch.
 */
export async function seedDeactivatedAlbum(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  artistId: string,
): Promise<string> {
  const title = 'Fixture: Deactivated Album'
  const existing = await prisma.album.findFirst({ where: { title, artistId } })
  if (existing) {
    await prisma.album.update({
      where: { id: existing.id },
      data: { deletedAt: existing.deletedAt ?? new Date() },
    })
    return existing.id
  }

  const created = await prisma.album.create({ data: { title, artistId, deletedAt: new Date() } })
  summary.albums += 1
  return created.id
}
