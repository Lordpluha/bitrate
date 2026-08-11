import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class PodcastsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page = 1, limit = 20, query?: string) {
    const pagination = normalizePagination(page, limit)
    const where = {
      deletedAt: null,
      ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.podcast.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: { _count: { select: { episodes: true } } },
      }),
      this.prisma.podcast.count({ where }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  async getById(id: string, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const podcast = await this.prisma.podcast.findFirst({ where: { id, deletedAt: null } })
    if (!podcast) throw new NotFoundException('Podcast not found')
    const [episodes, total] = await this.prisma.$transaction([
      this.prisma.episode.findMany({
        where: { podcastId: id, deletedAt: null },
        orderBy: [{ releaseDate: 'desc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.episode.count({ where: { podcastId: id, deletedAt: null } }),
    ])
    return {
      ...podcast,
      episodes: { data: episodes, total, page: pagination.page, limit: pagination.limit },
    }
  }

  async saveEpisode(userId: string, episodeId: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, deletedAt: null },
    })
    if (!episode) throw new NotFoundException('Episode not found')
    await this.prisma.userSavedEpisode.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: { userId, episodeId },
      update: {},
    })
  }

  async unsaveEpisode(userId: string, episodeId: string) {
    await this.prisma.userSavedEpisode.deleteMany({ where: { userId, episodeId } })
  }

  async getSavedEpisodes(userId: string, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, episode: { deletedAt: null } }
    const [saved, total] = await this.prisma.$transaction([
      this.prisma.userSavedEpisode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: { episode: { include: { podcast: true } } },
      }),
      this.prisma.userSavedEpisode.count({ where }),
    ])
    return {
      data: saved.map(({ episode, createdAt }) => ({ ...episode, savedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }
}
