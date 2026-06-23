import type { PrismaService } from '@infra/prisma/prisma.service'

/** The reset database value. */
export const resetDatabase = async (prisma: PrismaService) => {
  await resetUsersDatabase(prisma)
  await resetArtistsDatabase(prisma)
}

/** The reset users database value. */
export const resetUsersDatabase = async (prisma: PrismaService) => {
  await prisma.userSession.deleteMany()
  await prisma.user.deleteMany()
  await prisma.playlist.deleteMany()
}

/** The reset tracks database value. */
export const resetTracksDatabase = async (prisma: PrismaService) => {
  await prisma.track.deleteMany()
  await prisma.trackFile.deleteMany()
}

/** The reset artists database value. */
export const resetArtistsDatabase = async (prisma: PrismaService) => {
  await prisma.artistSession.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.album.deleteMany()
  await resetTracksDatabase(prisma)
}
