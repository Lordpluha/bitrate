import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import type { Genre, PrismaClient } from '@prisma/client'
import { SEED_GENRES } from '../seed.data'

/** A release with three or fewer tracks is an EP rather than an album. */
const EP_MAX_TRACKS = 3

/** Builds the genre catalogue, artist credits, and one album per artist. */
export class CatalogSeeder {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaClient) {}

  /** The logger value. */
  private readonly logger = new Logger(CatalogSeeder.name, { timestamp: true })

  /** Upserts every seed genre and returns the persisted rows. */
  private async upsertGenres(): Promise<Genre[]> {
    const genres: Genre[] = []

    for (const genre of SEED_GENRES) {
      genres.push(
        await this.prisma.genre.upsert({
          where: { slug: genre.slug },
          update: { name: genre.name, color: genre.color },
          create: {
            ...genre,
            description: `Discover ${genre.name.toLowerCase()} tracks, artists and releases.`,
            cover: faker.image.url({ width: 800, height: 800 }),
          },
        }),
      )
    }

    return genres
  }

  /** Creates the genre catalogue and links it to imported tracks and artists. */
  async createCatalogMetadata() {
    const genres = await this.upsertGenres()
    const tracks = await this.prisma.track.findMany({ select: { id: true, artistId: true } })
    const artistByTrackId = new Map(tracks.map((track) => [track.id, track.artistId]))

    const trackGenres = tracks.flatMap((track) =>
      faker.helpers
        .arrayElements(genres, Math.min(genres.length, faker.number.int({ min: 1, max: 2 })))
        .map((genre) => ({ trackId: track.id, genreId: genre.id })),
    )

    await this.prisma.trackGenre.createMany({ data: trackGenres, skipDuplicates: true })
    await this.prisma.trackArtist.createMany({
      data: tracks.map((track) => ({
        trackId: track.id,
        artistId: track.artistId,
        position: 0,
        isPrimary: true,
      })),
      skipDuplicates: true,
    })

    const artistGenres = [
      ...new Map(
        trackGenres.flatMap((item) => {
          const artistId = artistByTrackId.get(item.trackId)
          if (!artistId) return []
          return [[`${artistId}:${item.genreId}`, { artistId, genreId: item.genreId }] as const]
        }),
      ).values(),
    ]
    await this.prisma.artistGenre.createMany({ data: artistGenres, skipDuplicates: true })

    this.logger.log(`✅ Linked ${tracks.length} tracks to ${genres.length} genres`)
  }

  /** Creates one "Complete Collection" album holding every track of an artist. */
  private async createAlbumForArtist(
    artist: { id: string; username: string },
    tracks: { id: string; releaseDate: Date | null; cover: string | null }[],
  ) {
    const releaseDates = tracks
      .map((track) => track.releaseDate)
      .filter((d): d is Date => d !== null)
    const releaseDate =
      releaseDates.length > 0
        ? new Date(Math.min(...releaseDates.map((date) => date.getTime())))
        : new Date()

    const title = `${artist.username} - Complete Collection`
    const existing = await this.prisma.album.findFirst({
      where: { artistId: artist.id, title, deletedAt: null },
    })
    if (existing) return null

    return await this.prisma.$transaction(async (tx) => {
      const album = await tx.album.create({
        data: {
          title,
          cover:
            tracks.find((track) => track.cover)?.cover ??
            faker.image.url({ width: 1000, height: 1000 }),
          artistId: artist.id,
          releaseDate,
          description: `All tracks by ${artist.username}`,
          type: tracks.length <= EP_MAX_TRACKS ? 'EP' : 'ALBUM',
          label: 'NoCopyrightSounds',
          totalTracks: tracks.length,
          copyright: `© ${releaseDate.getFullYear()} ${artist.username}`,
        },
      })

      await tx.albumTrack.createMany({
        data: tracks.map((track, index) => ({
          albumId: album.id,
          trackId: track.id,
          trackNumber: index + 1,
          discNumber: 1,
        })),
      })

      const genreIds = await tx.trackGenre.findMany({
        where: { trackId: { in: tracks.map((track) => track.id) } },
        distinct: ['genreId'],
        select: { genreId: true },
      })
      await tx.albumGenre.createMany({
        data: genreIds.map(({ genreId }) => ({ albumId: album.id, genreId })),
        skipDuplicates: true,
      })

      return album
    })
  }

  /** Создаёт альбомы для артистов (1 альбом = все треки артиста). */
  async createAlbumsForArtists() {
    const artists = await this.prisma.artist.findMany({
      include: {
        tracks: {
          orderBy: [{ releaseDate: 'asc' }, { createdAt: 'asc' }],
          select: { id: true, releaseDate: true, cover: true },
        },
      },
    })

    let albumsCreated = 0
    for (const artist of artists) {
      if (artist.tracks.length === 0) continue

      const album = await this.createAlbumForArtist(artist, artist.tracks)
      if (!album) continue

      albumsCreated++
      this.logger.log(`📀 Created album "${album.title}" with ${artist.tracks.length} tracks`)
    }

    this.logger.log(`✅ Created ${albumsCreated} albums`)
    return albumsCreated
  }
}
