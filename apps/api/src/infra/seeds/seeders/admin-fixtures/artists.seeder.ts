import { resolveDeletedAtForUpdate } from './fixture-helpers'
import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixtureArtistIds } from './types'

/** Input to {@link upsertArtist} — always the row's intended, create-time shape. */
type UpsertArtistInput = {
  email: string
  username: string
  deletedAt: Date | null
}

/** Same create-only-`username` / forward-only-`deletedAt` re-run rule as {@link seedUsers}'s
 * `upsertUser` — see that file's TSDoc. */
async function upsertArtist(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertArtistInput,
): Promise<{ id: string }> {
  const existing = await prisma.artist.findUnique({ where: { email: input.email } })
  const artist = await prisma.artist.upsert({
    where: { email: input.email },
    create: input,
    update: {
      deletedAt: resolveDeletedAtForUpdate(existing?.deletedAt ?? null, input.deletedAt),
    },
  })
  if (!existing) summary.artists += 1
  return artist
}

/** One active fixture artist (the base for the fixture tracks/album) and two deactivated ones. */
export async function seedArtists(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
): Promise<FixtureArtistIds> {
  const active = await upsertArtist(prisma, summary, {
    email: 'fixture-artist@bitrate.fixture',
    username: 'fixture-artist',
    deletedAt: null,
  })

  const deactivatedArtistIds: string[] = []
  for (let index = 1; index <= 2; index += 1) {
    const artist = await upsertArtist(prisma, summary, {
      email: `fixture-deactivated-artist-${index}@bitrate.fixture`,
      username: `fixture-deactivated-artist-${index}`,
      deletedAt: new Date(),
    })
    deactivatedArtistIds.push(artist.id)
  }

  return { fixtureArtistId: active.id, deactivatedArtistIds }
}
