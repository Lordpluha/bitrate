import type { AdminFixturesPrismaClient, AdminFixturesSummary } from './types'

/** The one genre fixture — deliberately referenced by no track, for the guarded-delete case. */
export async function seedUnusedGenre(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
): Promise<string> {
  const slug = 'fixture-unused-genre'
  const existing = await prisma.genre.findUnique({ where: { slug } })
  if (existing) return existing.id

  const created = await prisma.genre.create({
    data: {
      slug,
      name: 'Fixture Unused Genre',
      description: 'Fixture: intentionally referenced by nothing, for the guarded-delete case.',
    },
  })
  summary.genres += 1
  return created.id
}
