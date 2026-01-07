import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

import { seedAlbumsWithTracks } from './albums.seed'
import { seedArtists } from './artists.seed'
import { seedPlaylistsWithTracks } from './playlists.seed'
import { seedTrackAlbumRelations, seedTracks } from './tracks.seed'
import { seedUserLikedTracks, seedUsers } from './users.seed'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('🌱 Starting advanced database seeding with relations...')

    // Очищаем существующие данные
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
    console.log('👨‍🎤 Creating artists...')
    await seedArtists(prisma, 30)

    console.log('📀 Creating albums with tracks...')
    await seedAlbumsWithTracks(prisma, 50)

    console.log('🎵 Creating additional standalone tracks...')
    await seedTracks(prisma, 150)

    console.log('👥 Creating users...')
    await seedUsers(prisma, 100)

    console.log('🎵 Creating playlists with tracks...')
    await seedPlaylistsWithTracks(prisma, 200)

    console.log('🔗 Creating additional track-album relations...')
    await seedTrackAlbumRelations(prisma)

    console.log('❤️ Creating user liked tracks...')
    await seedUserLikedTracks(prisma)

    // Показываем статистику
    const artistCount = await prisma.artist.count()
    const albumCount = await prisma.album.count()
    const trackCount = await prisma.track.count()
    const userCount = await prisma.user.count()
    const playlistCount = await prisma.playlist.count()

    console.log('📊 Seeding Statistics:')
    console.log(`   👨‍🎤 Artists: ${artistCount}`)
    console.log(`   📀 Albums: ${albumCount}`)
    console.log(`   🎵 Tracks: ${trackCount}`)
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   🎵 Playlists: ${playlistCount}`)

    // Показываем примеры связей
    const playlistsWithTracks = await prisma.playlist.findMany({
      include: {
        tracks: true,
        user: {
          select: { username: true },
        },
      },
      take: 3,
    })

    console.log('🔗 Sample playlist-track relations:')
    playlistsWithTracks.forEach((playlist) => {
      console.log(
        `   🎵 "${playlist.title}" by ${playlist.user.username} (${playlist.tracks.length} tracks)`,
      )
    })

    const albumsWithTracks = await prisma.album.findMany({
      include: {
        tracks: true,
        artist: {
          select: { username: true },
        },
      },
      take: 3,
    })

    console.log('🔗 Sample album-track relations:')
    albumsWithTracks.forEach((album) => {
      console.log(
        `   📀 "${album.title}" by ${album.artist.username} (${album.tracks.length} tracks)`,
      )
    })

    console.log('✅ Advanced database seeding completed!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
