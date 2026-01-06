import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { UserEntity } from 'src/users/entities'

export async function seedUsers(prisma: PrismaClient, count: number = 50) {
  const users: Omit<UserEntity, 'id' | 'createdAt'>[] = []

  // Примеры слов для создания username
  const adjectives = [
    'Cool',
    'Amazing',
    'Epic',
    'Super',
    'Mega',
    'Ultra',
    'Pro',
    'Master',
    'Dark',
    'Light',
    'Fire',
    'Ice',
    'Wild',
    'Free',
    'Bold',
    'Swift',
    'Bright',
    'Sharp',
    'Smart',
    'Clever',
    'Quick',
    'Silent',
    'Loud',
    'Calm',
  ]

  const nouns = [
    'Music',
    'Beat',
    'Rhythm',
    'Sound',
    'Voice',
    'Song',
    'Melody',
    'Tune',
    'Player',
    'Listener',
    'Fan',
    'Lover',
    'Hunter',
    'Seeker',
    'Creator',
    'Artist',
    'Musician',
    'Singer',
    'Dancer',
    'Dreamer',
    'Explorer',
    'Wanderer',
  ]

  // Примеры описаний для пользователей
  const descriptions = [
    'Music lover and playlist curator',
    'Always discovering new sounds',
    'Living life one song at a time',
    'Vinyl collector and audiophile',
    'Concert enthusiast',
    'Creating vibes through music',
    'Sharing the best tracks',
    'Music is my therapy',
    'Dancing through life',
    'Sound explorer',
    'Melody hunter',
    'Beat seeker',
    'Rhythm maker',
    'Song collector',
  ]

  for (let i = 0; i < count; i++) {
    // Создаем уникальный username
    const usernameType = faker.number.int({ min: 1, max: 3 })
    let username = ''

    switch (usernameType) {
      case 1:
        // Комбинация прилагательное + существительное
        username = `${faker.helpers.arrayElement(adjectives)}${faker.helpers.arrayElement(nouns)}${faker.number.int({ min: 1, max: 999 })}`
        break
      case 2:
        // Случайное имя пользователя с цифрами
        username = `${faker.internet.username()}${faker.number.int({ min: 10, max: 99 })}`
        break
      case 3:
        // Креативный username
        username = `${faker.helpers.arrayElement(adjectives).toLowerCase()}_${faker.helpers.arrayElement(nouns).toLowerCase()}_${faker.number.int({ min: 1, max: 99 })}`
        break
    }

    const user: Omit<UserEntity, 'id' | 'createdAt'> = {
      username: username.toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 8 }),
      avatar: faker.image.avatar(),
      description: faker.helpers.arrayElement([
        ...descriptions,
        faker.lorem.sentence({ min: 3, max: 8 }),
        null, // Некоторые пользователи без описания
        null,
      ]),
    }

    users.push(user)
  }

  try {
    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    })
    console.log(`✅ Seeded ${count} users`)
  } catch (error) {
    console.error('Error seeding users:', error)
  }
}

// Функция для создания "лайков" треков пользователями
export async function seedUserLikedTracks(prisma: PrismaClient) {
  try {
    // Получаем всех пользователей и треки
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    const tracks = await prisma.track.findMany({
      select: { id: true },
    })

    if (users.length === 0 || tracks.length === 0) {
      console.log('⚠️ No users or tracks found. Please seed users and tracks first.')
      return
    }

    console.log(`❤️ Creating liked tracks for ${users.length} users...`)

    let totalLikes = 0

    for (const user of users) {
      // Каждый пользователь лайкает от 5 до 50 треков
      const likesCount = faker.number.int({ min: 5, max: 50 })
      const likedTracks = faker.helpers.arrayElements(tracks, likesCount)

      for (const track of likedTracks) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              likedTracks: {
                connect: { id: track.id },
              },
            },
          })
          totalLikes++
        } catch {
          // Игнорируем ошибки дублирования
        }
      }
    }

    console.log(`✅ Created ${totalLikes} liked track relations`)
  } catch (error) {
    console.error('Error creating user liked tracks:', error)
  }
}
