import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

import { seedAlbums } from './albums.seed'
import { seedArtists } from './artists.seed'
import { seedPlaylists, seedPlaylistTracks } from './playlists.seed'
import { seedTrackAlbumRelations, seedTracks } from './tracks.seed'
import { seedUserLikedTracks, seedUsers } from './users.seed'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('🌱 Starting database seeding...')

    // Очищаем существующие данные (опционально)
    await prisma.playlist.deleteMany()
    console.log('🗑️ Cleared existing playlists')

    await prisma.session.deleteMany()
    console.log('🗑️ Cleared existing sessions')

    await prisma.user.deleteMany()
    console.log('🗑️ Cleared existing users')

    await prisma.track.deleteMany()
    console.log('🗑️ Cleared existing tracks')

    await prisma.album.deleteMany()
    console.log('🗑️ Cleared existing albums')

    await prisma.artist.deleteMany()
    console.log('🗑️ Cleared existing artists')

    // Добавляем фейковые данные
    await seedArtists(prisma, 50)
    await seedAlbums(prisma, 100)
    await seedTracks(prisma, 200)
    await seedUsers(prisma, 75)
    await seedPlaylists(prisma, 150)

    // Создаем связи между треками и альбомами
    await seedTrackAlbumRelations(prisma)

    // Создаем связи между пользователями и треками (лайки)
    await seedUserLikedTracks(prisma)

    // Создаем связи между плейлистами и треками
    await seedPlaylistTracks(prisma)

    console.log('✅ Database seeding completed!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
