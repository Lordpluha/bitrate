import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DeliveryDestination, type Prisma, ReleaseStatus } from '@prisma/client'
import {
  availabilityFromState,
  canTransition,
  type DestinationAvailability,
} from './distribution/delivery-state'
import {
  type DeliveryReceipt,
  DISTRIBUTION_ADAPTER,
  type DistributionAdapter,
} from './distribution/distribution-adapter'
import type { ListDistributionDto, UpdateDeliveryPlanDto } from './dtos/release-delivery.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'

const DESTINATIONS = Object.values(DeliveryDestination)

/** The plan is editable before submission and again once Bitrate approves the release. */
const DELIVERY_PLAN_STATUSES = [ReleaseStatus.DRAFT, ReleaseStatus.READY] as const

const DELIVERY_SELECT = {
  id: true,
  title: true,
  status: true,
  cover: true,
  updatedAt: true,
  destinations: { select: { destination: true } },
  territories: { select: { countryCode: true }, orderBy: { countryCode: 'asc' } },
  deliveries: {
    select: { destination: true, state: true, message: true, updatedAt: true },
  },
} as const satisfies Prisma.ReleaseSelect

type DeliveryRecord = Prisma.ReleaseGetPayload<{ select: typeof DELIVERY_SELECT }>

/**
 * Delivery plan and per-store state of owned releases. The plan is release data and changes
 * only on a draft through the version lock; the state comes from the distribution adapter
 * and partner-reported rows, so nothing reads as sent unless a partner reported it.
 */
@Injectable()
export class ReleaseDeliveryService {
  private readonly logger = new Logger(ReleaseDeliveryService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(DISTRIBUTION_ADAPTER) private readonly adapter: DistributionAdapter,
  ) {}

  async delivery(ownerArtistId: string, id: string) {
    const record = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: DELIVERY_SELECT,
    })
    if (!record) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    return this.view(record)
  }

  /**
   * Replaces the planned stores and territories in one versioned write. Allowed on a draft and
   * on an approved release, which is when delivery gets planned; never while under review.
   */
  updatePlan(ownerArtistId: string, id: string, input: UpdateDeliveryPlanDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
        {},
        DELIVERY_PLAN_STATUSES,
      )
      await tx.releaseDestination.deleteMany({ where: { releaseId: id } })
      if (input.destinations.length > 0) {
        await tx.releaseDestination.createMany({
          data: input.destinations.map((destination) => ({ releaseId: id, destination })),
        })
      }
      await tx.releaseTerritory.deleteMany({ where: { releaseId: id } })
      if (input.territories.mode === 'SELECTED') {
        await tx.releaseTerritory.createMany({
          data: input.territories.countries.map((countryCode) => ({ releaseId: id, countryCode })),
        })
      }
      const record = await tx.release.findFirstOrThrow({
        where: { id },
        select: DELIVERY_SELECT,
      })
      return { release, delivery: this.view(record) }
    })
  }

  /** Every active release with its plan and store states, newest first. */
  async listForArtist(ownerArtistId: string, input: ListDistributionDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const where = { ownerArtistId, deletedAt: null }
    const [records, total] = await Promise.all([
      this.prisma.release.findMany({
        where,
        select: DELIVERY_SELECT,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.release.count({ where }),
    ])
    return { data: records.map((record) => this.view(record)), total, page, limit }
  }

  /**
   * Applies partner-reported states through the delivery state machine. A report that skips a
   * step or goes backwards is ignored and logged, so the stored state never contradicts the
   * documented lifecycle. Used by the partner integration once one is connected.
   */
  async recordReceipts(releaseId: string, receipts: DeliveryReceipt[]): Promise<number> {
    let applied = 0
    for (const receipt of receipts) {
      const key = { releaseId_destination: { releaseId, destination: receipt.destination } }
      const current = await this.prisma.releaseDelivery.findUnique({
        where: key,
        select: { state: true },
      })
      if (!canTransition(current?.state ?? null, receipt.state)) {
        this.logger.warn(
          `Ignored delivery report ${current?.state ?? 'NONE'} -> ${receipt.state} for ${releaseId}/${receipt.destination}`,
        )
        continue
      }
      const data = {
        state: receipt.state,
        externalId: receipt.externalId ?? null,
        message: receipt.message ?? null,
      }
      await this.prisma.releaseDelivery.upsert({
        where: key,
        create: { releaseId, destination: receipt.destination, ...data },
        update: data,
      })
      applied += 1
    }
    return applied
  }

  private view(record: DeliveryRecord) {
    const planned = new Set(record.destinations.map((item) => item.destination))
    const reported = new Map(record.deliveries.map((item) => [item.destination, item]))
    const destinations = DESTINATIONS.map((destination) => {
      const delivery = reported.get(destination)
      return {
        destination,
        planned: planned.has(destination),
        availability: delivery
          ? availabilityFromState(delivery.state)
          : this.availability(destination),
        message: delivery?.message ?? null,
        updatedAt: delivery?.updatedAt ?? null,
      }
    })
    return {
      releaseId: record.id,
      title: record.title,
      status: record.status,
      cover: record.cover,
      updatedAt: record.updatedAt,
      partner: { connected: this.adapter.isConnected(), name: this.adapter.partner },
      territories:
        record.territories.length === 0
          ? { mode: 'WORLDWIDE' as const, countries: [] }
          : {
              mode: 'SELECTED' as const,
              countries: record.territories.map((item) => item.countryCode),
            },
      destinations,
      sent: record.deliveries.length > 0,
    }
  }

  private availability(destination: DeliveryDestination): DestinationAvailability {
    if (!this.adapter.isConnected()) return 'NOT_CONNECTED'
    return this.adapter.supports(destination) ? 'NOT_SENT' : 'UNAVAILABLE'
  }
}
