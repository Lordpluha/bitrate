import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import type { CreateReportDto } from './moderation.dto'
import { ModerationService } from './moderation.service'

const REPORTER_ID = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea1'
const TARGET_ID = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea2'

const reportDto = (entityType: CreateReportDto['entityType']): CreateReportDto => ({
  entityType,
  entityId: TARGET_ID,
  reason: 'Harmful content',
})

describe('ModerationService', () => {
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>
  let service: ModerationService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    transaction.$queryRaw.mockResolvedValue([] as never)
    transaction.moderationReport.findFirst.mockResolvedValue(null)
    transaction.moderationReport.count.mockResolvedValue(0)
    service = new ModerationService(prisma)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('serializes, validates, and creates a report with a public response projection', async () => {
    transaction.track.findFirst.mockResolvedValue({ id: TARGET_ID } as never)
    transaction.moderationReport.create.mockResolvedValue({ id: 'report-1' } as never)

    await expect(service.createReport(REPORTER_ID, reportDto('track'))).resolves.toEqual({
      id: 'report-1',
    })

    const advisoryQuery = transaction.$queryRaw.mock.calls[0]?.[0] as Prisma.Sql
    expect(advisoryQuery.strings.join(' ')).toContain('pg_advisory_xact_lock')
    expect(advisoryQuery.values).toContain(`moderation-report:${REPORTER_ID}`)
    expect(transaction.track.findFirst).toHaveBeenCalledWith({
      where: {
        id: TARGET_ID,
        deletedAt: null,
        processingStatus: 'READY',
        artist: { deletedAt: null },
      },
      select: { id: true },
    })
    expect(transaction.moderationReport.create).toHaveBeenCalledWith({
      data: { reporterId: REPORTER_ID, ...reportDto('track') },
      select: expect.not.objectContaining({ reporterId: true }),
    })
  })

  it('rejects a mismatched or nonexistent entity without probing other models', async () => {
    transaction.album.findFirst.mockResolvedValue(null)
    transaction.track.findFirst.mockResolvedValue({ id: TARGET_ID } as never)

    await expect(service.createReport(REPORTER_ID, reportDto('album'))).rejects.toThrow(
      NotFoundException,
    )

    expect(transaction.album.findFirst).toHaveBeenCalledWith({
      where: { id: TARGET_ID, deletedAt: null, artist: { deletedAt: null } },
      select: { id: true },
    })
    expect(transaction.track.findFirst).not.toHaveBeenCalled()
    expect(transaction.moderationReport.create).not.toHaveBeenCalled()
  })

  it('does not allow reports against private or deleted playlists', async () => {
    transaction.playlist.findFirst.mockResolvedValue(null)

    await expect(service.createReport(REPORTER_ID, reportDto('playlist'))).rejects.toThrow(
      NotFoundException,
    )

    expect(transaction.playlist.findFirst).toHaveBeenCalledWith({
      where: { id: TARGET_ID, deletedAt: null, isPublic: true },
      select: { id: true },
    })
  })

  it('requires both an episode and its podcast to be active', async () => {
    transaction.episode.findFirst.mockResolvedValue(null)

    await expect(service.createReport(REPORTER_ID, reportDto('episode'))).rejects.toThrow(
      NotFoundException,
    )

    expect(transaction.episode.findFirst).toHaveBeenCalledWith({
      where: { id: TARGET_ID, deletedAt: null, podcast: { deletedAt: null } },
      select: { id: true },
    })
  })

  it('rejects self-reporting an account', async () => {
    const dto = { ...reportDto('user'), entityId: REPORTER_ID }

    await expect(service.createReport(REPORTER_ID, dto)).rejects.toThrow(BadRequestException)

    expect(transaction.user.findFirst).not.toHaveBeenCalled()
    expect(transaction.moderationReport.create).not.toHaveBeenCalled()
  })

  it('returns an existing active report idempotently', async () => {
    const existing = { id: 'report-1', status: 'OPEN' }
    transaction.artist.findFirst.mockResolvedValue({ id: TARGET_ID } as never)
    transaction.moderationReport.findFirst.mockResolvedValue(existing as never)

    await expect(service.createReport(REPORTER_ID, reportDto('artist'))).resolves.toBe(existing)

    expect(transaction.moderationReport.count).not.toHaveBeenCalled()
    expect(transaction.moderationReport.create).not.toHaveBeenCalled()
  })

  it('enforces a per-reporter hourly database rate policy', async () => {
    const now = Date.UTC(2026, 7, 18, 12)
    jest.spyOn(Date, 'now').mockReturnValue(now)
    transaction.podcast.findFirst.mockResolvedValue({ id: TARGET_ID } as never)
    transaction.moderationReport.count.mockResolvedValue(10)

    const result = service.createReport(REPORTER_ID, reportDto('podcast'))

    await expect(result).rejects.toBeInstanceOf(HttpException)
    await result.catch((error: HttpException) => expect(error.getStatus()).toBe(429))
    expect(transaction.moderationReport.count).toHaveBeenCalledWith({
      where: {
        reporterId: REPORTER_ID,
        createdAt: { gte: new Date(now - 60 * 60 * 1_000) },
      },
    })
    expect(transaction.moderationReport.create).not.toHaveBeenCalled()
  })
})
