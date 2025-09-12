import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '../../src/prisma/prisma.service'

export interface TestUser {
  id: string
  email: string
  username: string
  password: string
  accessToken: string
}

export async function createTestUser(
  prismaService: PrismaService,
  jwtService: JwtService,
  userData: { email: string; username: string; password: string }
): Promise<TestUser> {
  const user = await prismaService.user.create({
    data: userData
  })

  const accessToken = jwtService.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '1h' }
  )

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password: userData.password,
    accessToken
  }
}

export async function cleanupTestUser(
  prismaService: PrismaService,
  userId: string
): Promise<void> {
  // Clean up user's playlists first due to foreign key constraints
  await prismaService.playlist.deleteMany({
    where: { userId }
  })

  // Then delete the user
  await prismaService.user.delete({
    where: { id: userId }
  })
}

export async function createTestPlaylist(
  prismaService: PrismaService,
  userId: string,
  playlistData: { title: string; description?: string }
) {
  return await prismaService.playlist.create({
    data: {
      title: playlistData.title,
      description: playlistData.description || null,
      cover: '',
      userId
    }
  })
}
