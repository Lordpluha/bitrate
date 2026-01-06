import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { TrackEntity } from 'src/tracks/entities'

// Функция для генерации реалистичных URL аудиофайлов
function generateAudioUrl(): string {
  const domains = [
    'https://audio.example.com',
    'https://music-storage.s3.amazonaws.com',
    'https://cdn.musicplatform.com',
    'https://tracks.cloudinary.com',
  ]

  const domain = faker.helpers.arrayElement(domains)
  const filename = faker.system.fileName({ extensionCount: 0 })

  return `${domain}/tracks/${filename}.mp3`
}

export async function seedTracks(prisma: PrismaClient, count: number = 100) {
  // Сначала получаем всех существующих артистов
  const artists = await prisma.artist.findMany({
    select: { id: true },
  })

  if (artists.length === 0) {
    console.log('⚠️ No artists found. Please seed artists first.')
    return
  }

  const tracks: Omit<TrackEntity, 'id' | 'createdAt'>[] = []

  // Список музыкальных жанров для более реалистичных названий
  const musicGenres = [
    'Rock',
    'Pop',
    'Jazz',
    'Blues',
    'Hip Hop',
    'Electronic',
    'Classical',
    'Country',
    'Folk',
    'Reggae',
    'Metal',
    'Punk',
    'R&B',
    'Soul',
    'Funk',
  ]

  // Примеры слов для создания названий треков
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
    'Voice',
  ]

  for (let i = 0; i < count; i++) {
    // Случайно выбираем артиста
    const randomArtist = faker.helpers.arrayElement(artists)

    // Создаем более реалистичное название трека
    const titleType = faker.number.int({ min: 1, max: 3 })
    let title = ''

    switch (titleType) {
      case 1:
        // Простое название из одного-двух слов
        title = faker.helpers.arrayElements(trackWords, { min: 1, max: 2 }).join(' ')
        break
      case 2:
        // Название с жанром
        title = `${faker.helpers.arrayElement(trackWords)} ${faker.helpers.arrayElement(musicGenres)}`
        break
      case 3:
        // Более креативное название
        title = `${faker.helpers.arrayElement(trackWords)} in the ${faker.helpers.arrayElement(['Night', 'Rain', 'City', 'Dark', 'Light'])}`
        break
    }

    const track: Omit<TrackEntity, 'id' | 'createdAt'> = {
      title,
      audioUrl: generateAudioUrl(),
      cover: faker.image.url({ width: 800, height: 800 }),
      artistId: randomArtist.id,
    }

    tracks.push(track)
  }

  try {
    await prisma.track.createMany({
      data: tracks,
      skipDuplicates: true,
    })
    console.log(`✅ Seeded ${count} tracks`)
  } catch (error) {
    console.error('Error seeding tracks:', error)
  }
}

// Новая функция для связывания треков с альбомами
export async function seedTrackAlbumRelations(prisma: PrismaClient) {
  try {
    // Получаем все треки и альбомы
    const tracks = await prisma.track.findMany({
      select: { id: true, artistId: true },
    })

    const albums = await prisma.album.findMany({
      select: { id: true, artistId: true },
    })

    if (tracks.length === 0 || albums.length === 0) {
      console.log('⚠️ No tracks or albums found. Please seed tracks and albums first.')
      return
    }

    console.log(
      `🔗 Creating relations between ${tracks.length} tracks and ${albums.length} albums...`,
    )

    // Создаем связи между треками и альбомами
    const relations: Array<{ trackId: string; albumId: string }> = []

    for (const track of tracks) {
      // Находим альбомы того же артиста
      const artistAlbums = albums.filter((album) => album.artistId === track.artistId)

      if (artistAlbums.length > 0) {
        // 80% вероятность, что трек будет принадлежать основному альбому артиста
        if (faker.datatype.boolean({ probability: 0.8 })) {
          const primaryAlbum = faker.helpers.arrayElement(artistAlbums)
          relations.push({
            trackId: track.id,
            albumId: primaryAlbum.id,
          })
        }

        // 30% вероятность, что трек также будет в сборнике
        if (faker.datatype.boolean({ probability: 0.3 }) && artistAlbums.length > 1) {
          const lastRelationAlbumId =
            relations.length > 0 ? relations[relations.length - 1]?.albumId : null
          const availableAlbums = artistAlbums.filter((album) => album.id !== lastRelationAlbumId)

          if (availableAlbums.length > 0) {
            const compilationAlbum = faker.helpers.arrayElement(availableAlbums)
            relations.push({
              trackId: track.id,
              albumId: compilationAlbum.id,
            })
          }
        }
      }

      // 10% вероятность, что трек попадет в альбом другого артиста (коллаборация/сборник)
      if (faker.datatype.boolean({ probability: 0.1 })) {
        const randomAlbum = faker.helpers.arrayElement(albums)
        // Проверяем, что эта связь еще не существует
        const existingRelation = relations.find(
          (rel) => rel.trackId === track.id && rel.albumId === randomAlbum.id,
        )
        if (!existingRelation) {
          relations.push({
            trackId: track.id,
            albumId: randomAlbum.id,
          })
        }
      }
    }

    // Убираем дубликаты
    const uniqueRelations = relations.filter(
      (relation, index, self) =>
        index ===
        self.findIndex((r) => r.trackId === relation.trackId && r.albumId === relation.albumId),
    )

    // Создаем связи в базе данных
    for (const relation of uniqueRelations) {
      await prisma.track.update({
        where: { id: relation.trackId },
        data: {
          albums: {
            connect: { id: relation.albumId },
          },
        },
      })
    }

    console.log(`✅ Created ${uniqueRelations.length} track-album relations`)
  } catch (error) {
    console.error('Error creating track-album relations:', error)
  }
}
