import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

export async function seedAlbums(prisma: PrismaClient, count: number = 30) {
  // Сначала получаем всех существующих артистов
  const artists = await prisma.artist.findMany({
    select: { id: true }
  })

  if (artists.length === 0) {
    console.log('⚠️ No artists found. Please seed artists first.')
    return
  }

  const albums: Array<{
    title: string
    cover: string
    artistId: string
    description: string
  }> = []

  // Примеры слов для создания названий альбомов
  const albumWords = [
    'Greatest Hits',
    'Best Of',
    'Collection',
    'Anthology',
    'Live',
    'Unplugged',
    'The Journey',
    'Midnight',
    'Golden',
    'Silver',
    'Platinum',
    'Diamond',
    'Echoes',
    'Reflections',
    'Memories',
    'Dreams',
    'Visions',
    'Stories',
    'Chronicles',
    'Legacy',
    'Evolution',
    'Revolution',
    'Transformation'
  ]

  const albumTypes = [
    'Album',
    'EP',
    'Single',
    'Compilation',
    'Live Album',
    'Remix Album'
  ]

  for (let i = 0; i < count; i++) {
    // Случайно выбираем артиста
    const randomArtist = faker.helpers.arrayElement(artists)

    // Создаем название альбома
    const titleType = faker.number.int({ min: 1, max: 4 })
    let title = ''

    switch (titleType) {
      case 1:
        // Простое название
        title = faker.helpers.arrayElement(albumWords)
        break
      case 2:
        // Название с годом
        title = `${faker.helpers.arrayElement(albumWords)} ${faker.date.past({ years: 10 }).getFullYear()}`
        break
      case 3:
        // Креативное название
        title = `${faker.helpers.arrayElement(['The', 'My', 'Our'])} ${faker.helpers.arrayElement(albumWords)}`
        break
      case 4:
        // Название с типом
        title = `${faker.helpers.arrayElement(albumWords)} - ${faker.helpers.arrayElement(albumTypes)}`
        break
    }

    const album = {
      title,
      cover: faker.image.url({ width: 1000, height: 1000 }),
      artistId: randomArtist.id,
      description: faker.lorem.paragraph(1)
    }

    albums.push(album)
  }

  try {
    await prisma.album.createMany({
      data: albums,
      skipDuplicates: true
    })
    console.log(`✅ Seeded ${count} albums`)
  } catch (error) {
    console.error('Error seeding albums:', error)
  }
}

// Новая функция для создания альбомов с треками
export async function seedAlbumsWithTracks(
  prisma: PrismaClient,
  albumCount: number = 30
) {
  // Сначала получаем всех существующих артистов
  const artists = await prisma.artist.findMany({
    select: { id: true, username: true }
  })

  if (artists.length === 0) {
    console.log('⚠️ No artists found. Please seed artists first.')
    return
  }

  // Примеры слов для треков
  const trackWords = [
    'Love',
    'Heart',
    'Dreams',
    'Night',
    'Light',
    'Fire',
    'Sky',
    'Ocean',
    'Mountain',
    'River',
    'Storm',
    'Rain',
    'Sun',
    'Moon',
    'Star',
    'Wind',
    'Dance',
    'Song',
    'Melody',
    'Rhythm',
    'Beat',
    'Sound',
    'Music',
    'Voice'
  ]

  // Примеры слов для альбомов
  const albumWords = [
    'Greatest Hits',
    'Best Of',
    'Collection',
    'Anthology',
    'Live',
    'Unplugged',
    'The Journey',
    'Midnight',
    'Golden',
    'Silver',
    'Platinum',
    'Diamond',
    'Echoes',
    'Reflections',
    'Memories',
    'Dreams',
    'Visions',
    'Stories',
    'Chronicles',
    'Legacy',
    'Evolution',
    'Revolution',
    'Transformation'
  ]

  function generateAudioUrl(): string {
    const domains = [
      'https://audio.example.com',
      'https://music-storage.s3.amazonaws.com',
      'https://cdn.musicplatform.com',
      'https://tracks.cloudinary.com'
    ]

    const domain = faker.helpers.arrayElement(domains)
    const filename = faker.system.fileName({ extensionCount: 0 })

    return `${domain}/tracks/${filename}.mp3`
  }

  try {
    for (let i = 0; i < albumCount; i++) {
      const artist = faker.helpers.arrayElement(artists)

      // Создаем название альбома
      const albumTitle = faker.helpers.arrayElement(albumWords)

      // Определяем количество треков в альбоме (от 5 до 15)
      const trackCount = faker.number.int({ min: 5, max: 15 })

      // Создаем альбом с треками
      const album = await prisma.album.create({
        data: {
          title: albumTitle,
          cover: faker.image.url({ width: 1000, height: 1000 }),
          artistId: artist.id,
          description: faker.lorem.paragraph(1),
          tracks: {
            create: Array.from({ length: trackCount }, (_, trackIndex) => {
              // Создаем название трека
              const trackTitleType = faker.number.int({ min: 1, max: 3 })
              let trackTitle = ''

              switch (trackTitleType) {
                case 1:
                  trackTitle = faker.helpers
                    .arrayElements(trackWords, { min: 1, max: 2 })
                    .join(' ')
                  break
                case 2:
                  trackTitle = `${faker.helpers.arrayElement(trackWords)} ${trackIndex + 1}`
                  break
                case 3:
                  trackTitle = `${faker.helpers.arrayElement(trackWords)} (${faker.helpers.arrayElement(['Remix', 'Live', 'Acoustic', 'Extended'])})`
                  break
              }

              return {
                title: trackTitle,
                audioUrl: generateAudioUrl(),
                cover: faker.image.url({ width: 800, height: 800 }),
                artistId: artist.id
              }
            })
          }
        },
        include: {
          tracks: true
        }
      })

      console.log(
        `📀 Created album "${album.title}" with ${album.tracks.length} tracks`
      )
    }

    console.log(`✅ Created ${albumCount} albums with tracks`)
  } catch (error) {
    console.error('Error creating albums with tracks:', error)
  }
}
