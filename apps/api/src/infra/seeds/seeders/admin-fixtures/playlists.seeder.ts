import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixturePlaylistIds } from './types'

/** Input to {@link upsertPlaylist}. */
type UpsertPlaylistInput = {
  title: string
  userId: string
  isPublic: boolean
}

async function upsertPlaylist(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertPlaylistInput,
): Promise<{ id: string }> {
  const existing = await prisma.playlist.findFirst({
    where: { title: input.title, userId: input.userId },
  })
  if (existing) {
    await prisma.playlist.update({ where: { id: existing.id }, data: { isPublic: input.isPublic } })
    return existing
  }

  const created = await prisma.playlist.create({ data: input })
  summary.playlists += 1
  return created
}

/** A normal public playlist and a spam-titled one, both flagged by a moderation report. */
export async function seedPlaylists(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  ownerId: string,
): Promise<FixturePlaylistIds> {
  const publicPlaylist = await upsertPlaylist(prisma, summary, {
    title: 'Fixture: Public Playlist',
    userId: ownerId,
    isPublic: true,
  })
  const abusivePlaylist = await upsertPlaylist(prisma, summary, {
    title: 'Fixture: FREE DOWNLOADS CLICK HERE!!!',
    userId: ownerId,
    isPublic: true,
  })
  return { publicPlaylistId: publicPlaylist.id, abusivePlaylistId: abusivePlaylist.id }
}
