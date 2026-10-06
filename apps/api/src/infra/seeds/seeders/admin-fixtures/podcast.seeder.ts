import type { AdminFixturesPrismaClient, AdminFixturesSummary } from './types'

const FIXTURE_PODCAST_TITLE = 'Fixture: Podcast With A Taken-Down Episode'
const FIXTURE_PODCAST_PUBLISHER = 'Fixture Publisher'

/**
 * One fixture podcast with three episodes, one of them taken down while the podcast stays
 * active — the shape the panel's episode-level take-down is verified against. Keyed on
 * `(title, publisher)` since `Podcast` has no unique natural key. Created once with its episodes;
 * an existing row is left entirely alone, so a take-down or restore an operator performed
 * through the panel survives a re-run.
 */
export async function seedFixturePodcast(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
): Promise<void> {
  const existing = await prisma.podcast.findFirst({
    where: { title: FIXTURE_PODCAST_TITLE, publisher: FIXTURE_PODCAST_PUBLISHER },
  })
  if (existing) return

  const episode = (number: number, deletedAt: Date | null = null) => ({
    title: `Fixture: Episode ${number}`,
    audioUrl: `fixture-episode-${number}.mp3`,
    duration: 1200 + number * 60,
    releaseDate: new Date(Date.UTC(2026, 0, number)),
    deletedAt,
  })

  await prisma.podcast.create({
    data: {
      title: FIXTURE_PODCAST_TITLE,
      publisher: FIXTURE_PODCAST_PUBLISHER,
      language: 'en',
      episodes: { create: [episode(1), episode(2, new Date()), episode(3)] },
    },
  })
  summary.podcasts += 1
}
