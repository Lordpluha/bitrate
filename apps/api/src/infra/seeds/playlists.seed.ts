import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

export async function seedPlaylists(prisma: PrismaClient, count: number = 100) {
  // Сначала получаем всех существующих пользователей
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  })

  if (users.length === 0) {
    console.log('⚠️ No users found. Please seed users first.')
    return
  }

  const playlists: Array<{
    title: string
    cover: string | null
    description: string | null
    userId: string
  }> = []

  // Примеры названий плейлистов
  const playlistTitles = [
    'My Favorites',
    'Chill Vibes',
    'Workout Mix',
    'Road Trip',
    'Study Music',
    'Party Time',
    'Relax & Unwind',
    'Morning Coffee',
    'Late Night',
    'Feel Good',
    'Throwback Hits',
    'New Discoveries',
    'Summer Vibes',
    'Winter Mood',
    'Weekend Mix',
    'Focus Flow',
    'Happy Songs',
    'Sad Boy Hours',
    'Energy Boost',
    'Acoustic Sessions',
    'Electronic Dreams',
    'Rock Classics',
    'Hip Hop Heat',
    'Jazz & Blues',
    'Pop Perfection',
    'Indie Finds',
    'Alternative Edge',
    'Classical Collection',
    'World Music',
    'Country Roads',
  ]

  // Дополнительные слова для создания уникальных названий
  const moodWords = [
    'Ultimate',
    'Best',
    'Top',
    'Essential',
    'Premium',
    'Exclusive',
    'Special',
    'Daily',
    'Weekly',
    'Monthly',
    'Seasonal',
    'Personal',
    'Private',
    'Public',
  ]

  const timeWords = [
    '2024',
    '2023',
    'Today',
    'This Week',
    'This Month',
    'Summer',
    'Winter',
    'Spring',
    'Fall',
    'Morning',
    'Evening',
    'Night',
    'Midnight',
    'Dawn',
  ]

  // Описания для плейлистов
  const playlistDescriptions = [
    'A collection of my all-time favorite tracks',
    'Perfect songs for relaxing and unwinding',
    'High-energy music to fuel your workout',
    'The perfect soundtrack for long drives',
    'Instrumental and ambient music for focus',
    'Upbeat tracks to get the party started',
    'Discover new artists and hidden gems',
    'Songs that always put me in a good mood',
    'The best throwback hits from the past',
    'Smooth tunes for a lazy afternoon',
    'Late night vibes and contemplative tracks',
    'Energizing music to start the day right',
  ]

  for (let i = 0; i < count; i++) {
    // Случайно выбираем пользователя
    const randomUser = faker.helpers.arrayElement(users)

    // Создаем название плейлиста
    const titleType = faker.number.int({ min: 1, max: 4 })
    let title = ''

    switch (titleType) {
      case 1:
        // Базовое название из списка
        title = faker.helpers.arrayElement(playlistTitles)
        break
      case 2:
        // Название с модификатором
        title = `${faker.helpers.arrayElement(moodWords)} ${faker.helpers.arrayElement(playlistTitles)}`
        break
      case 3:
        // Название с временной меткой
        title = `${faker.helpers.arrayElement(playlistTitles)} ${faker.helpers.arrayElement(timeWords)}`
        break
      case 4:
        // Персонализированное название
        title = `${randomUser.username}'s ${faker.helpers.arrayElement(playlistTitles)}`
        break
    }

    // 70% вероятность наличия обложки
    const cover = faker.datatype.boolean({ probability: 0.7 })
      ? faker.image.url({ width: 800, height: 800 })
      : null

    // 60% вероятность наличия описания
    const description = faker.datatype.boolean({ probability: 0.6 })
      ? faker.helpers.arrayElement([
          ...playlistDescriptions,
          faker.lorem.sentence({ min: 4, max: 12 }),
        ])
      : null

    const playlist = {
      title,
      cover,
      description,
      userId: randomUser.id,
    }

    playlists.push(playlist)
  }

  try {
    await prisma.playlist.createMany({
      data: playlists,
      skipDuplicates: true,
    })
    console.log(`✅ Seeded ${count} playlists`)
  } catch (error) {
    console.error('Error seeding playlists:', error)
  }
}

// Функция для добавления треков в плейлисты
export async function seedPlaylistTracks(prisma: PrismaClient) {
  try {
    // Получаем все плейлисты и треки
    const playlists = await prisma.playlist.findMany({
      select: { id: true, title: true, userId: true },
    })

    const tracks = await prisma.track.findMany({
      select: { id: true },
    })

    if (playlists.length === 0 || tracks.length === 0) {
      console.log('⚠️ No playlists or tracks found. Please seed playlists and tracks first.')
      return
    }

    console.log(`🎵 Adding tracks to ${playlists.length} playlists...`)

    let totalTracksAdded = 0

    for (const playlist of playlists) {
      // Каждый плейлист содержит от 10 до 100 треков
      const tracksCount = faker.number.int({ min: 10, max: 100 })
      const playlistTracks = faker.helpers.arrayElements(tracks, tracksCount)

      for (const track of playlistTracks) {
        try {
          await prisma.playlist.update({
            where: { id: playlist.id },
            data: {
              tracks: {
                connect: { id: track.id },
              },
            },
          })
          totalTracksAdded++
        } catch {
          // Игнорируем ошибки дублирования
        }
      }
    }

    console.log(`✅ Added ${totalTracksAdded} track-playlist relations`)
  } catch (error) {
    console.error('Error adding tracks to playlists:', error)
  }
}

// Функция для создания плейлистов сразу с треками (более эффективно)
export async function seedPlaylistsWithTracks(prisma: PrismaClient, count: number = 50) {
  // Получаем пользователей и треки
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  })

  const tracks = await prisma.track.findMany({
    select: { id: true },
  })

  if (users.length === 0 || tracks.length === 0) {
    console.log('⚠️ No users or tracks found. Please seed users and tracks first.')
    return
  }

  const playlistTitles = [
    'My Favorites',
    'Chill Vibes',
    'Workout Mix',
    'Road Trip',
    'Study Music',
    'Party Time',
    'Relax & Unwind',
    'Morning Coffee',
    'Late Night',
    'Feel Good',
  ]

  const playlistDescriptions = [
    'A collection of my all-time favorite tracks',
    'Perfect songs for relaxing and unwinding',
    'High-energy music to fuel your workout',
    'The perfect soundtrack for long drives',
    'Songs that always put me in a good mood',
  ]

  try {
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users)
      const playlistTitle = faker.helpers.arrayElement(playlistTitles)

      // Количество треков в плейлисте (15-50)
      const trackCount = faker.number.int({ min: 15, max: 50 })
      const selectedTracks = faker.helpers.arrayElements(tracks, trackCount)

      // Создаем плейлист с треками
      const playlist = await prisma.playlist.create({
        data: {
          title: `${user.username}'s ${playlistTitle}`,
          cover: faker.datatype.boolean({ probability: 0.8 })
            ? faker.image.url({ width: 800, height: 800 })
            : null,
          description: faker.helpers.arrayElement([
            ...playlistDescriptions,
            faker.lorem.sentence({ min: 4, max: 8 }),
            null,
          ]),
          userId: user.id,
          tracks: {
            connect: selectedTracks.map((track) => ({ id: track.id })),
          },
        },
        include: {
          tracks: true,
        },
      })

      console.log(`🎵 Created playlist "${playlist.title}" with ${playlist.tracks.length} tracks`)
    }

    console.log(`✅ Created ${count} playlists with tracks`)
  } catch (error) {
    console.error('Error creating playlists with tracks:', error)
  }
}
