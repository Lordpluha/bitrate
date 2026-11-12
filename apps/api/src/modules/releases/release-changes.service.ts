import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { type Prisma, ReleaseChangeField, ReleaseChangeStatus } from '@prisma/client'
import type { SubmitReleaseChangesDto } from './dtos/release-changes.dto'
import { RELEASE_ERRORS } from './errors'
import {
  acceptsChanges,
  type ChangeableRelease,
  cancelPendingChanges,
  lockReleaseForChanges,
  pendingTarget,
  RELEASE_CHANGE_SELECT,
  type ReleaseChangeRecord,
  removePendingCovers,
  storePendingCover,
  toChangeView,
} from './release-change-rules'

/** Most changes listed for one release; far above what an artist proposes in practice. */
const LIST_LIMIT = 200

type ProposedChange = Omit<Prisma.ReleaseChangeCreateManyRequestInput, 'releaseId'>

const REQUEST_SELECT = {
  id: true,
  releaseId: true,
  message: true,
  closedAt: true,
  createdAt: true,
  changes: { select: RELEASE_CHANGE_SELECT, orderBy: { createdAt: 'asc' } },
} as const satisfies Prisma.ReleaseChangeRequestSelect

type RequestRecord = Prisma.ReleaseChangeRequestGetPayload<{ select: typeof REQUEST_SELECT }>

/**
 * The artist side of changes to a published release. Proposals never touch the live release:
 * they wait as PENDING changes until staff decide them (`ReleaseChangeReviewService`).
 */
@Injectable()
export class ReleaseChangesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** Pending changes plus the latest decision for each title, cover and recording. */
  async list(ownerArtistId: string, releaseId: string) {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, ownerArtistId, deletedAt: null },
      select: { id: true },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const changes = await this.prisma.releaseChange.findMany({
      where: { releaseId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: LIST_LIMIT,
      select: { ...RELEASE_CHANGE_SELECT, request: { select: { message: true } } },
    })
    const decided = new Set<string>()
    const visible = changes.filter((change) => {
      if (change.status === ReleaseChangeStatus.PENDING) return true
      if (
        change.status !== ReleaseChangeStatus.APPROVED &&
        change.status !== ReleaseChangeStatus.REJECTED
      ) {
        return false
      }
      const target = pendingTarget(change.field, change.draftId)
      if (decided.has(target)) return false
      decided.add(target)
      return true
    })
    const data = await Promise.all(
      visible.map(async ({ request, ...change }) => ({
        ...(await toChangeView(this.storage, change)),
        reviewerMessage: request.message,
      })),
    )
    return { data }
  }

  /**
   * Queues the proposed values for review. A cover is stored privately before the transaction
   * and removed again when the request is refused, so a failure leaves no file behind.
   */
  async submit(
    ownerArtistId: string,
    releaseId: string,
    input: SubmitReleaseChangesDto,
    cover: Express.Multer.File | undefined,
  ) {
    if (input.title === undefined && !input.recordings?.length && !cover) {
      throw new BadRequestException(RELEASE_ERRORS.CHANGES_EMPTY)
    }
    const coverKey = cover ? await storePendingCover(this.storage, cover) : null
    try {
      const request = await this.prisma.$transaction(async (tx) => {
        const release = await lockReleaseForChanges(tx, releaseId, ownerArtistId)
        if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
        if (!acceptsChanges(release))
          throw new ConflictException(RELEASE_ERRORS.CHANGES_NOT_ALLOWED)
        const changes = [
          ...releaseChanges(release, input.title, coverKey),
          ...(await this.recordingChanges(tx, release, input.recordings ?? [])),
        ]
        return tx.releaseChangeRequest.create({
          data: {
            releaseId,
            changes: { create: changes.map((change) => ({ ...change, releaseId })) },
          },
          select: REQUEST_SELECT,
        })
      })
      return await this.toRequestView(request)
    } catch (error) {
      await removePendingCovers(this.storage, [coverKey])
      if (isPrismaP2002(error)) throw new ConflictException(RELEASE_ERRORS.CHANGE_ALREADY_PENDING)
      throw error
    }
  }

  /** Withdraws what is still pending in a request; decided changes keep their outcome. */
  async withdraw(ownerArtistId: string, releaseId: string, requestId: string) {
    const { request, covers } = await this.prisma.$transaction(async (tx) => {
      const release = await lockReleaseForChanges(tx, releaseId, ownerArtistId)
      if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
      const found = await tx.releaseChangeRequest.findFirst({
        where: { id: requestId, releaseId },
        select: { id: true },
      })
      if (!found) throw new NotFoundException(RELEASE_ERRORS.CHANGE_REQUEST_NOT_FOUND)
      const now = new Date()
      const withdrawn = await tx.releaseChange.updateManyAndReturn({
        where: { requestId, status: ReleaseChangeStatus.PENDING },
        data: { status: ReleaseChangeStatus.WITHDRAWN, pendingTarget: null, decidedAt: now },
        select: { field: true, proposedValue: true },
      })
      if (!withdrawn.length) throw new ConflictException(RELEASE_ERRORS.CHANGE_NOT_PENDING)
      const closed = await tx.releaseChangeRequest.update({
        where: { id: requestId },
        data: { closedAt: now },
        select: REQUEST_SELECT,
      })
      return { request: closed, covers: withdrawn.map((change) => change.proposedValue) }
    })
    await removePendingCovers(this.storage, covers)
    return this.toRequestView(request)
  }

  /**
   * Cancels the pending changes of a release that is being deleted or taken down, inside the
   * caller's transaction. Call {@link discardCovers} with the result after commit.
   */
  cancelPending(tx: Prisma.TransactionClient, releaseId: string): Promise<string[]> {
    return cancelPendingChanges(tx, releaseId)
  }

  /** Cancels pending changes in a transaction of its own, then removes their proposed covers. */
  async cancelPendingNow(releaseId: string): Promise<void> {
    const covers = await this.prisma.$transaction((tx) => cancelPendingChanges(tx, releaseId))
    await this.discardCovers(covers)
  }

  discardCovers(keys: readonly string[]): Promise<void> {
    return removePendingCovers(this.storage, keys)
  }

  /**
   * Renames only recordings uploaded into this release. A compilation reuse, or a recording that
   * never went live or was removed by Bitrate, is renamed from nowhere.
   */
  private async recordingChanges(
    tx: Prisma.TransactionClient,
    release: ChangeableRelease,
    recordings: { id: string; title: string }[],
  ): Promise<ProposedChange[]> {
    if (!recordings.length) return []
    const drafts = await tx.artistTrackDraft.findMany({
      where: {
        id: { in: recordings.map((item) => item.id) },
        releaseId: release.id,
        ownerArtistId: release.ownerArtistId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        sourceTrackId: true,
        publishedAs: {
          select: { track: { select: { deletedAt: true, moderationBlockedAt: true } } },
        },
      },
    })
    const byId = new Map(drafts.map((draft) => [draft.id, draft]))
    return recordings.map((item) => {
      const draft = byId.get(item.id)
      if (!draft) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
      const track = draft.publishedAs?.track
      if (draft.sourceTrackId || !track || track.deletedAt || track.moderationBlockedAt) {
        throw new ConflictException(RELEASE_ERRORS.RECORDING_LOCKED)
      }
      return titleChange(ReleaseChangeField.RECORDING_TITLE, draft.title, item.title, draft.id)
    })
  }

  private async toRequestView({ changes, ...request }: RequestRecord) {
    return {
      ...request,
      changes: await Promise.all(
        changes.map((change: ReleaseChangeRecord) => toChangeView(this.storage, change)),
      ),
    }
  }
}

/** The release title and cover changes of a submission. */
function releaseChanges(
  release: ChangeableRelease,
  title: string | undefined,
  coverKey: string | null,
): ProposedChange[] {
  const changes: ProposedChange[] = []
  if (title !== undefined) {
    changes.push(titleChange(ReleaseChangeField.RELEASE_TITLE, release.title, title))
  }
  if (coverKey) {
    changes.push({
      field: ReleaseChangeField.RELEASE_COVER,
      pendingTarget: pendingTarget(ReleaseChangeField.RELEASE_COVER),
      previousValue: release.cover,
      proposedValue: coverKey,
    })
  }
  return changes
}

function titleChange(
  field: ReleaseChangeField,
  current: string,
  proposed: string,
  draftId?: string,
): ProposedChange {
  if (current === proposed) throw new ConflictException(RELEASE_ERRORS.CHANGE_UNCHANGED)
  return {
    field,
    ...(draftId ? { draftId } : {}),
    pendingTarget: pendingTarget(field, draftId),
    previousValue: current,
    proposedValue: proposed,
  }
}
