import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { ArtistEntity } from 'src/artists/entities'

export async function seedArtists(prisma: PrismaClient, count: number = 20) {
  const artists: Omit<ArtistEntity, 'id' | 'createdAt'>[] = []

  for (let i = 0; i < count; i++) {
    const artist: Omit<ArtistEntity, 'id' | 'createdAt'> = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 8 }),
      bio: faker.lorem.paragraph(2),
      avatar: faker.image.avatar(),
      backgroundImage: faker.image.url({ width: 1920, height: 1080 })
    }
    artists.push(artist)
  }

  try {
    await prisma.artist.createMany({
      data: artists,
      skipDuplicates: true
    })
    console.log(`✅ Seeded ${count} artists`)
  } catch (error) {
    console.error('Error seeding artists:', error)
  }
}
