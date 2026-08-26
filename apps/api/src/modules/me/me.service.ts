import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { UpdatePlayerDto, UpdateQueueDto, UpdateSettingsDto, UpsertDeviceDto } from './dtos'

const DEFAULT_SETTINGS = {
  language: 'en',
  streamingQuality: 'automatic',
  normalizeVolume: true,
  compactLibrary: false,
  showNowPlaying: true,
  autoplay: true,
  explicitContent: true,
  privateSession: false,
} as const

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  getSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...DEFAULT_SETTINGS },
      update: {},
    })
  }

  updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...DEFAULT_SETTINGS, ...dto },
      update: dto,
    })
  }

  getPlayer(userId: string) {
    return this.prisma.playerState.findUnique({
      where: { userId },
      include: {
        device: true,
        currentTrack: {
          include: { artist: { select: { id: true, username: true, avatar: true } } },
        },
        queue: {
          orderBy: { position: 'asc' },
          include: {
            track: { include: { artist: { select: { id: true, username: true, avatar: true } } } },
          },
        },
      },
    })
  }

  async updatePlayer(userId: string, dto: UpdatePlayerDto) {
    if (dto.deviceId) {
      const device = await this.prisma.playerDevice.findFirst({
        where: { id: dto.deviceId, userId },
      })
      if (!device) throw new BadRequestException('Player device does not belong to the user')
    }
    if (dto.currentTrackId) {
      const track = await this.prisma.track.findFirst({
        where: { id: dto.currentTrackId, processingStatus: 'READY', deletedAt: null },
      })
      if (!track) throw new BadRequestException('Track is not ready for playback')
    }

    return this.prisma.playerState.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
      include: { device: true, currentTrack: true },
    })
  }

  async replaceQueue(userId: string, dto: UpdateQueueDto) {
    const state = await this.prisma.playerState.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })
    const uniqueIds = [...new Set(dto.trackIds)]
    const readyCount = await this.prisma.track.count({
      where: { id: { in: uniqueIds }, processingStatus: 'READY', deletedAt: null },
    })
    if (readyCount !== uniqueIds.length)
      throw new BadRequestException('Queue contains unavailable tracks')

    await this.prisma.$transaction([
      this.prisma.playerQueueItem.deleteMany({ where: { playerStateId: state.id } }),
      this.prisma.playerQueueItem.createMany({
        data: dto.trackIds.map((trackId, position) => ({
          playerStateId: state.id,
          trackId,
          position,
        })),
      }),
    ])
    return this.getPlayer(userId)
  }

  getDevices(userId: string) {
    return this.prisma.playerDevice.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { lastSeenAt: 'desc' }],
    })
  }

  async upsertDevice(userId: string, dto: UpsertDeviceDto) {
    const device = dto.id
      ? await this.prisma.playerDevice.findFirst({ where: { id: dto.id, userId } })
      : null
    if (dto.id && !device) throw new NotFoundException('Player device not found')

    const persist = async (tx: Prisma.TransactionClient) => {
      if (dto.isActive) {
        await tx.playerDevice.updateMany({ where: { userId }, data: { isActive: false } })
      }
      if (!device) {
        return tx.playerDevice.create({
          data: { userId, name: dto.name, type: dto.type, isActive: dto.isActive },
        })
      }
      return tx.playerDevice.update({
        where: { id: device.id },
        data: { name: dto.name, type: dto.type, isActive: dto.isActive, lastSeenAt: new Date() },
      })
    }

    if (!dto.isActive) return persist(this.prisma as never)

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(persist, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        })
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined
        if (attempt === 3 || (code !== 'P2002' && code !== 'P2034')) throw error
      }
    }

    throw new Error('Unable to activate player device')
  }

  async removeDevice(userId: string, deviceId: string) {
    const result = await this.prisma.playerDevice.deleteMany({ where: { id: deviceId, userId } })
    if (!result.count) throw new NotFoundException('Player device not found')
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const where = { userId }
    const [data, total, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ])
    return { data, total, unread, page: pagination.page, limit: pagination.limit }
  }

  async readNotification(userId: string, notificationId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    })
    if (!result.count) throw new NotFoundException('Notification not found')
  }

  async readAllNotifications(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })
    return subscription ?? { userId, plan: 'FREE', status: 'ACTIVE' }
  }
}
