import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import type { PrismaClient } from '@prisma/client'
import type { FakerService } from '../faker.service'
import { SEED_PASSWORD, SEED_SEARCH_QUERIES } from '../seed.data'
import { sample } from './seed.helpers'
import type { IPasswordHasher } from './seed.types'

/** One in every eight seeded users gets a paid plan. */
const PREMIUM_EVERY_NTH_USER = 8

/** Fills user accounts, their playlists, and their saved library. */
export class LibrarySeeder {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaClient,
    private readonly faker: FakerService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /** The logger value. */
  private readonly logger = new Logger(LibrarySeeder.name, { timestamp: true })

  /** Создаёт пользователей. */
  async createUsers(count = 50) {
    const passwordHash = await this.passwordHasher.hashPassword(SEED_PASSWORD)
    await this.prisma.user.createMany({
      data: this.faker.generateUsers(count, passwordHash),
      skipDuplicates: true,
    })

    const createdUsers = await this.prisma.user.findMany({ select: { id: true } })
    await this.prisma.userSettings.createMany({
      data: createdUsers.map((user) => ({ userId: user.id })),
      skipDuplicates: true,
    })
    await this.prisma.subscription.createMany({
      data: createdUsers.map((user, index) => ({
        userId: user.id,
        plan: index % PREMIUM_EVERY_NTH_USER === 0 ? 'PREMIUM_INDIVIDUAL' : 'FREE',
        status: 'ACTIVE',
      })),
    })

    this.logger.log(`✅ Seeded ${createdUsers.length} verified users with settings`)
    this.logger.log(`🔐 Demo login: test@example.com / ${SEED_PASSWORD}`)
  }

  /** Создаёт плейлисты из существующих треков для пользователей. */
  async createPlaylistsForUsers(playlistCount = 100) {
    const users = await this.prisma.user.findMany({ select: { id: true } })
    const tracks = await this.prisma.track.findMany({ select: { id: true } })

    if (users.length === 0) {
      this.logger.log('⚠️ No users found. Skipping playlists.')
      return
    }
    if (tracks.length === 0) {
      this.logger.log('⚠️ No tracks found. Skipping playlists.')
      return
    }

    const playlists = this.faker.generatePlaylists(
      users.map((user) => user.id),
      playlistCount,
    )

    let totalTracksAdded = 0
    for (const playlist of playlists) {
      const trackCount = Math.min(tracks.length, faker.number.int({ min: 8, max: 24 }))
      const selectedTracks = faker.helpers.arrayElements(tracks, trackCount)

      await this.prisma.playlist.create({
        data: {
          ...playlist,
          followersCount: playlist.isPublic ? faker.number.int({ min: 0, max: 50_000 }) : 0,
          tracks: {
            create: selectedTracks.map((track, position) => ({
              trackId: track.id,
              addedById: playlist.userId,
              position,
              addedAt: faker.date.recent({ days: 120 }),
            })),
          },
        },
      })
      totalTracksAdded += selectedTracks.length
    }

    this.logger.log(`✅ Created ${playlists.length} playlists with ${totalTracksAdded} tracks`)
  }

  /** Fills each user's search history and starter notifications. */
  private async createUserActivity(users: { id: string }[]) {
    await this.prisma.searchHistory.createMany({
      data: users.flatMap((user) =>
        faker.helpers.arrayElements(SEED_SEARCH_QUERIES, 3).map((query) => ({
          userId: user.id,
          query,
          searchedAt: faker.date.recent({ days: 30 }),
        })),
      ),
    })
    await this.prisma.notification.createMany({
      data: users.flatMap((user) => [
        {
          userId: user.id,
          type: 'NEW_RELEASE' as const,
          title: 'New music is waiting for you',
          body: 'Open your release feed to discover recently added tracks.',
        },
        {
          userId: user.id,
          type: 'SYSTEM' as const,
          title: 'Welcome to Spotify Clone',
          readAt: faker.datatype.boolean() ? new Date() : null,
        },
      ]),
    })
  }

  /** Создаёт лайки пользователей. */
  async createUserLikes() {
    const users = await this.prisma.user.findMany({ select: { id: true } })
    const tracks = await this.prisma.track.findMany({ select: { id: true } })
    if (users.length === 0 || tracks.length === 0) {
      this.logger.log('⚠️ No users or tracks found.')
      return
    }

    const artists = await this.prisma.artist.findMany({ select: { id: true } })
    const albums = await this.prisma.album.findMany({ select: { id: true } })
    const playlists = await this.prisma.playlist.findMany({
      where: { isPublic: true },
      select: { id: true, userId: true },
    })

    const likedTracks = users.flatMap((user) =>
      sample(tracks, 5, 20).map((track) => ({
        userId: user.id,
        trackId: track.id,
        createdAt: faker.date.recent({ days: 180 }),
      })),
    )
    const likedAlbums = users.flatMap((user) =>
      sample(albums, 1, 5).map((album) => ({ userId: user.id, albumId: album.id })),
    )
    const followedArtists = users.flatMap((user) =>
      sample(artists, 1, 5).map((artist) => ({ userId: user.id, artistId: artist.id })),
    )
    const likedPlaylists = users.flatMap((user) =>
      sample(
        playlists.filter((playlist) => playlist.userId !== user.id),
        1,
        5,
      ).map((playlist) => ({ userId: user.id, playlistId: playlist.id })),
    )
    const history = users.flatMap((user) =>
      sample(tracks, 8, 24).map((track) => ({
        userId: user.id,
        trackId: track.id,
        listenedAt: faker.date.recent({ days: 60 }),
      })),
    )

    await this.prisma.userLikedTrack.createMany({ data: likedTracks, skipDuplicates: true })
    await this.prisma.userLikedAlbum.createMany({ data: likedAlbums, skipDuplicates: true })
    await this.prisma.userLikedArtist.createMany({ data: followedArtists, skipDuplicates: true })
    await this.prisma.userFollowedArtist.createMany({
      data: followedArtists,
      skipDuplicates: true,
    })
    await this.prisma.userLikedPlaylist.createMany({ data: likedPlaylists, skipDuplicates: true })
    await this.prisma.listeningHistory.createMany({ data: history })
    await this.createUserActivity(users)

    this.logger.log(
      `✅ Created ${likedTracks.length} track likes and ${history.length} history entries`,
    )
  }
}
