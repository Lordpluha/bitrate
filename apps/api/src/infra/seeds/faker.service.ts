import { faker } from '@faker-js/faker'

/**
 * Сервис для генерации фейковых данных
 */
export class FakerService {
  /**
   * Генерирует данные пользователей
   */
  static generateUsers(count: number) {
    const users: Array<{
      username: string
      email: string
      password: string
      avatar: string
      description: string | null
      updatedAt: Date
    }> = []

    // Тестовый пользователь
    users.push({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'https://i.pravatar.cc/150?img=1',
      description: 'Test user for automated testing',
      updatedAt: new Date(),
    })

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
    ]
    const nouns = [
      'Music',
      'Beat',
      'Rhythm',
      'Sound',
      'Voice',
      'Song',
      'Player',
      'Listener',
      'Fan',
      'Lover',
    ]
    const descriptions = [
      'Music lover and playlist curator',
      'Always discovering new sounds',
      'Living life one song at a time',
      'Concert enthusiast',
      'Creating vibes through music',
    ]

    for (let i = 0; i < count; i++) {
      const username =
        `${faker.helpers.arrayElement(adjectives)}${faker.helpers.arrayElement(nouns)}${faker.number.int({ min: 1, max: 999 })}`.toLowerCase()

      users.push({
        username,
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 8 }),
        avatar: faker.image.avatar(),
        description: faker.helpers.arrayElement([...descriptions, null, null]),
        updatedAt: new Date(),
      })
    }

    return users
  }

  /**
   * Генерирует данные плейлистов для пользователей
   */
  static generatePlaylists(userIds: string[], count: number) {
    const playlistTitles = [
      'My Favorites',
      'Chill Vibes',
      'Workout Mix',
      'Road Trip',
      'Study Music',
      'Party Time',
      'Morning Coffee',
      'Late Night',
      'Feel Good',
      'Throwback Hits',
      'New Discoveries',
      'Summer Vibes',
      'Focus Flow',
      'Energy Boost',
      'Relax & Unwind',
    ]

    const playlists: Array<{
      title: string
      cover: string
      description: string
      isPublic: boolean
      userId: string
    }> = []

    for (let i = 0; i < count; i++) {
      const randomUser = faker.helpers.arrayElement(userIds)
      const isPublic = faker.datatype.boolean({ probability: 0.7 })

      playlists.push({
        title: `${faker.helpers.arrayElement(playlistTitles)} ${faker.number.int({ min: 1, max: 99 })}`,
        cover: faker.image.url({ width: 800, height: 800 }),
        description: faker.lorem.sentence(),
        isPublic,
        userId: randomUser,
      })
    }

    return playlists
  }
}
