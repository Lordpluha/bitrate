import { PrismaService } from '@infra/prisma/prisma.service'

export const resetDatabase = async (prisma: PrismaService) => {
  await resetUsersDatabase(prisma)
  await resetArtistsDatabase(prisma)
}

export const resetUsersDatabase = async (prisma: PrismaService) => {
  await prisma.userSession.deleteMany()
  await prisma.user.deleteMany()
  await prisma.playlist.deleteMany()
}

export const resetTracksDatabase = async (prisma: PrismaService) => {
  await prisma.track.deleteMany()
  await prisma.trackFile.deleteMany()
}

export const resetArtistsDatabase = async (prisma: PrismaService) => {
  await prisma.artistSession.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.album.deleteMany()
  await resetTracksDatabase(prisma)
}
