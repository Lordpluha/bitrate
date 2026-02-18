import { NestFactory } from '@nestjs/core'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Pool } from 'pg'
import { AppModule } from '../../app.module'
import { TracksService } from '../../modules/tracks/tracks.service'
import config from './config'
import { DownloadResourcesService } from './download-resources.service'
import { SeedService } from './seed.service'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Подготовка директорий для хранения файлов
const STORAGE_BASE = process.cwd()
const TRACKS_DIR = join(STORAGE_BASE, config.storagePaths.tracks)
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
  let app

  try {
    console.log('🌱 Starting database seeding...')
    console.log('📡 NCS Import + Faker Data Generation\n')

    // Создаём NestJS application context для доступа к сервисам
    console.log('🔧 Initializing NestJS application context...')
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    })

    // Получаем необходимые сервисы через DI
    const tracksService = app.get(TracksService)

    // Создаём сервисы для импорта
    const downloadService = new DownloadResourcesService(STORAGE_BASE)
    const seedService = new SeedService(prisma, downloadService, tracksService)

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
    if (app) {
      await app.close()
    }
    await prisma.$disconnect()
    await pool.end()
  }
}

// Запускаем seeding
main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
