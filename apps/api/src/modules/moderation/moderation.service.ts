import { PrismaService } from '@infra/prisma/prisma.service'
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { CreateReportDto } from './moderation.dto'

const ACTIVE_REPORT_STATUSES = ['OPEN', 'REVIEWING'] as const
const REPORT_RATE_WINDOW_MS = 60 * 60 * 1_000
const REPORT_RATE_LIMIT = 10
const REPORT_SELECT = {
  id: true,
  entityType: true,
  entityId: true,
  reason: true,
  details: true,
  status: true,
  createdAt: true,
} as const

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  createReport(reporterId: string, dto: CreateReportDto) {
    return this.prisma.$transaction(async (transaction) => {
      // A per-reporter transaction lock makes duplicate and rate checks atomic
      // across API replicas without requiring a new database constraint.
      await transaction.$queryRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${`moderation-report:${reporterId}`}, 0))`,
      )
      await this.assertTargetReportable(transaction, reporterId, dto)

      const duplicate = await transaction.moderationReport.findFirst({
        where: {
          reporterId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          status: { in: [...ACTIVE_REPORT_STATUSES] },
        },
        orderBy: { createdAt: 'desc' },
        select: REPORT_SELECT,
      })
      if (duplicate) return duplicate

      const recentReports = await transaction.moderationReport.count({
        where: {
          reporterId,
          createdAt: { gte: new Date(Date.now() - REPORT_RATE_WINDOW_MS) },
        },
      })
      if (recentReports >= REPORT_RATE_LIMIT) {
        throw new HttpException('Too many moderation reports', HttpStatus.TOO_MANY_REQUESTS)
      }

      return transaction.moderationReport.create({
        data: { reporterId, ...dto },
        select: REPORT_SELECT,
      })
    })
  }

  private async assertTargetReportable(
    transaction: Prisma.TransactionClient,
    reporterId: string,
    dto: CreateReportDto,
  ) {
    if (dto.entityType === 'user' && dto.entityId === reporterId) {
      throw new BadRequestException('You cannot report your own account')
    }

    let target: { id: string } | null
    switch (dto.entityType) {
      case 'track':
        target = await transaction.track.findFirst({
          where: {
            id: dto.entityId,
            deletedAt: null,
            processingStatus: 'READY',
            artist: { deletedAt: null },
          },
          select: { id: true },
        })
        break
      case 'album':
        target = await transaction.album.findFirst({
          where: { id: dto.entityId, deletedAt: null, artist: { deletedAt: null } },
          select: { id: true },
        })
        break
      case 'playlist':
        target = await transaction.playlist.findFirst({
          where: { id: dto.entityId, deletedAt: null, isPublic: true },
          select: { id: true },
        })
        break
      case 'artist':
        target = await transaction.artist.findFirst({
          where: { id: dto.entityId, deletedAt: null },
          select: { id: true },
        })
        break
      case 'podcast':
        target = await transaction.podcast.findFirst({
          where: { id: dto.entityId, deletedAt: null },
          select: { id: true },
        })
        break
      case 'episode':
        target = await transaction.episode.findFirst({
          where: { id: dto.entityId, deletedAt: null, podcast: { deletedAt: null } },
          select: { id: true },
        })
        break
      case 'user':
        target = await transaction.user.findFirst({
          where: { id: dto.entityId, deletedAt: null },
          select: { id: true },
        })
        break
    }

    if (!target) throw new NotFoundException('Reportable target not found')
  }
}
