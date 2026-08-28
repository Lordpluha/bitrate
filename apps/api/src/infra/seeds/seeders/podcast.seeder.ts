import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import type { PrismaClient } from '@prisma/client'
import { SEED_PODCASTS } from '../seed.data'
import { sample } from './seed.helpers'

/** Episodes produced per seeded podcast. */
const EPISODES_PER_PODCAST = 4

/** Tracks borrowed as demo episode audio. */
const AUDIO_SOURCE_LIMIT = 24

/** Creates podcasts, episodes and saved episode relations for library screens. */
export class PodcastSeeder {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaClient) {}

  /** The logger value. */
  private readonly logger = new Logger(PodcastSeeder.name, { timestamp: true })

  /** Runs the podcast seeding step. */
  async createPodcasts() {
    const tracks = await this.prisma.track.findMany({
      where: { deletedAt: null },
      select: { audioUrl: true, cover: true, duration: true },
      take: AUDIO_SOURCE_LIMIT,
    })
    if (tracks.length === 0) {
      this.logger.warn('⚠️ No tracks available for demo episode audio')
      return
    }

    const episodeIds: string[] = []
    for (const [podcastIndex, podcast] of SEED_PODCASTS.entries()) {
      const created = await this.prisma.podcast.create({
        data: {
          ...podcast,
          cover:
            tracks[podcastIndex % tracks.length]?.cover ??
            faker.image.url({ width: 800, height: 800 }),
          episodes: {
            create: Array.from({ length: EPISODES_PER_PODCAST }, (_, episodeIndex) => {
              const index = (podcastIndex * EPISODES_PER_PODCAST + episodeIndex) % tracks.length
              const source = tracks[index]

              return {
                title: `${podcast.title}: Episode ${episodeIndex + 1}`,
                description: faker.lorem.paragraph(),
                audioUrl: source?.audioUrl ?? '',
                cover: source?.cover ?? null,
                duration: source?.duration ?? null,
                releaseDate: faker.date.recent({ days: 120 }),
              }
            }),
          },
        },
        include: { episodes: { select: { id: true } } },
      })
      episodeIds.push(...created.episodes.map((episode) => episode.id))
    }

    const users = await this.prisma.user.findMany({ select: { id: true } })
    await this.prisma.userSavedEpisode.createMany({
      data: users.flatMap((user) =>
        sample(episodeIds, 1, 3).map((episodeId) => ({ userId: user.id, episodeId })),
      ),
      skipDuplicates: true,
    })

    this.logger.log(`✅ Created ${SEED_PODCASTS.length} podcasts and ${episodeIds.length} episodes`)
  }
}
