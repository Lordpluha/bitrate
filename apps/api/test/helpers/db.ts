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
  await prisma.album.deleteMany()
  await resetTracksDatabase(prisma)
  await prisma.artist.deleteMany()
}

/**
 * Marks an account's email as verified.
 *
 * Login refuses unverified accounts, so an end-to-end flow that registers and
 * then signs in has to pass through verification the way a real user would.
 */
export const verifyUserEmail = async (prisma: PrismaService, email: string) => {
  await prisma.user.updateMany({
    where: { email },
    data: { emailVerifiedAt: new Date() },
  })
}

/** Marks an artist account's email as verified. */
export const verifyArtistEmail = async (prisma: PrismaService, email: string) => {
  await prisma.artist.updateMany({
    where: { email },
    data: { emailVerifiedAt: new Date() },
  })
}
