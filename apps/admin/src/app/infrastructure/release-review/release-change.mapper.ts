import type {
  ReleaseChange,
  ReleaseChangeField,
  ReleaseChangeRequestDetail,
  ReleaseChangeRequestRow,
  ReleaseChangeStatus,
  ReviewedReleaseStatus,
} from '@domain/release-review'
import { toStaticMediaUrl } from '../http/static-media-url'
import type {
  ChangeDto,
  ChangeRequestDto,
  ChangeRowDto,
  WireChangeField,
  WireChangeStatus,
} from './release-change.dto'

/** See `album.mapper.ts`: a member the API grows later is a compile error here. */
const TO_DOMAIN_FIELD = {
  RELEASE_TITLE: 'RELEASE_TITLE',
  RELEASE_COVER: 'RELEASE_COVER',
  RECORDING_TITLE: 'RECORDING_TITLE',
} as const satisfies Record<WireChangeField, ReleaseChangeField>

const TO_DOMAIN_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<WireChangeStatus, ReleaseChangeStatus>

const toDate = (value: string | null): Date | null => (value ? new Date(value) : null)

export function toReleaseChangeRequestRow(dto: ChangeRowDto): ReleaseChangeRequestRow {
  return {
    id: dto.id,
    releaseId: dto.releaseId,
    releaseTitle: dto.releaseTitle,
    releaseCoverUrl: toStaticMediaUrl(dto.releaseCover, 'releases/covers'),
    artistUsername: dto.artistUsername,
    changeCount: dto.changeCount,
    pendingCount: dto.pendingCount,
    createdAt: new Date(dto.createdAt),
    closedAt: toDate(dto.closedAt),
  }
}

/** Covers become image URLs; a pending one is already a signed link and passes through. */
function toReleaseChange(dto: ChangeDto): ReleaseChange {
  const field = TO_DOMAIN_FIELD[dto.field]
  const image = (value: string | null) =>
    field === 'RELEASE_COVER' ? toStaticMediaUrl(value, 'releases/covers') : value
  return {
    id: dto.id,
    field,
    recordingId: dto.recordingId,
    previousValue: image(dto.previousValue),
    proposedValue: image(dto.proposedValue),
    status: TO_DOMAIN_STATUS[dto.status],
    reason: dto.reason,
    decidedAt: toDate(dto.decidedAt),
    reviewerUsername: dto.reviewerUsername,
  }
}

export function toReleaseChangeRequestDetail(dto: ChangeRequestDto): ReleaseChangeRequestDetail {
  return {
    id: dto.id,
    message: dto.message,
    createdAt: new Date(dto.createdAt),
    closedAt: toDate(dto.closedAt),
    release: {
      id: dto.release.id,
      title: dto.release.title,
      coverUrl: toStaticMediaUrl(dto.release.cover, 'releases/covers'),
      status: dto.release.status satisfies ReviewedReleaseStatus,
      artistId: dto.release.artistId,
      artistUsername: dto.release.artistUsername,
    },
    changes: dto.changes.map(toReleaseChange),
  }
}
