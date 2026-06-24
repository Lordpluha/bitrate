import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Queue } from 'bullmq'
import { Pool } from 'pg'
import config from './config'
import { DownloadResourcesService } from './download-resources.service'
import { FakerService } from './faker.service'
import { SeedService } from './seed.service'

/** The pool value. */
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
/** The adapter value. */
const adapter = new PrismaPg(pool)
/** The prisma value. */
const prisma = new PrismaClient({ adapter })

/** Audio processing queue. */
const audioQueue = new Queue('audio-processing', {
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
})

// Подготовка директорий для хранения файлов
/** The storage base value. */
const STORAGE_BASE = process.cwd()
/** The tracks dir value. */
const TRACKS_DIR = join(STORAGE_BASE, config.storagePaths.tracks)
/** The covers dir value. */
const COVERS_DIR = join(STORAGE_BASE, config.storagePaths.covers)

console.log('📁 Storage directories:')
console.log('  Tracks:', TRACKS_DIR)
console.log('  Covers:', COVERS_DIR)

// Создаём директории если их нет
if (!existsSync(TRACKS_DIR)) {
  mkdirSync(TRACKS_DIR, { recursive: true })
}
if (!existsSync(COVERS_DIR)) {
  mkdirSync(COVERS_DIR, { recursive: true })
}

/**
 * Главная функция для запуска всех seed процессов
 */
async function main() {
  try {
    console.log('🌱 Starting database seeding...')
    console.log('📡 NCS Import + Faker Data Generation\n')

    // Создаём сервисы
    const downloadService = new DownloadResourcesService(STORAGE_BASE)
    const seedService = new SeedService(prisma, downloadService, new FakerService(), audioQueue, TRACKS_DIR)

    // Шаг 1: Очистка базы данных (опционально)
    if (config.clearBeforeImport) {
      await seedService.clearDatabase()
    }

    // Шаг 2: Импорт артистов и треков из NCS
    const stats = await seedService.importFromNCS()

    // Шаг 3: Создание альбомов для артистов (1 альбом = все треки артиста)
    await seedService.createAlbumsForArtists()

    // Шаг 4: Создание пользователей (faker)
    await seedService.createUsers(50)

    // Шаг 5: Создание плейлистов с треками для пользователей
    await seedService.createPlaylistsForUsers(100)

    // Шаг 6: Добавление лайков для пользователей
    await seedService.createUserLikes()

    // Шаг 7: Финальная статистика
    await seedService.printStats(stats)

    console.log('\n✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error)
    throw error
  } finally {
    await audioQueue.close()
    await prisma.$disconnect()
    await pool.end()
  }
}

// Запускаем seeding
main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
