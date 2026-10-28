import type {
  ReleaseKind,
  ReleaseQueueStatus,
  ReleaseReviewDecision,
  ReleaseSubmission,
  ReleaseSubmissionDetail,
  ReviewedReleaseStatus,
  SubmissionReview,
} from '@domain/release-review'
import { API_BASE_URL } from '../http/api.config'
import type {
  ReleaseDetailDto,
  ReleaseReviewDto,
  ReleaseRowDto,
  WireQueueStatus,
  WireReleaseStatus,
  WireReleaseType,
  WireReviewDecision,
} from './release-review.dto'

/** Covers uploaded through the API are stored as a `/static/...` path on its origin. */
function toCoverUrl(cover: string | null): string | null {
  if (!cover) return null
  return cover.startsWith('/') ? `${API_BASE_URL}${cover}` : cover
}

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null
}

/** See `album.mapper.ts`: a member the API grows later is a compile error here. */
const TO_DOMAIN_KIND = {
  ALBUM: 'ALBUM',
  SINGLE: 'SINGLE',
  EP: 'EP',
  COMPILATION: 'COMPILATION',
} as const satisfies Record<WireReleaseType, ReleaseKind>

const TO_DOMAIN_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  READY: 'READY',
  REJECTED: 'REJECTED',
  SCHEDULED: 'SCHEDULED',
  PUBLISHING: 'PUBLISHING',
  PUBLISH_FAILED: 'PUBLISH_FAILED',
  RELEASED: 'RELEASED',
  UNPUBLISHED: 'UNPUBLISHED',
} as const satisfies Record<WireReleaseStatus, ReviewedReleaseStatus>

const TO_DOMAIN_DECISION = {
  APPROVED: 'APPROVED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
} as const satisfies Record<WireReviewDecision, ReleaseReviewDecision>

const TO_WIRE_QUEUE_STATUS = {
  SUBMITTED: 'SUBMITTED',
  READY: 'READY',
  REJECTED: 'REJECTED',
  PUBLISHING: 'PUBLISHING',
  PUBLISH_FAILED: 'PUBLISH_FAILED',
  RELEASED: 'RELEASED',
  ALL: 'ALL',
} as const satisfies Record<ReleaseQueueStatus, WireQueueStatus>

export function toWireQueueStatus(status: ReleaseQueueStatus): WireQueueStatus {
  return TO_WIRE_QUEUE_STATUS[status]
}

export function toReleaseSubmission(dto: ReleaseRowDto): ReleaseSubmission {
  return {
    id: dto.id,
    title: dto.title,
    kind: TO_DOMAIN_KIND[dto.type],
    status: TO_DOMAIN_STATUS[dto.status],
    coverUrl: toCoverUrl(dto.cover),
    submittedAt: toDate(dto.submittedAt),
    updatedAt: new Date(dto.updatedAt),
    artistId: dto.artistId,
    artistUsername: dto.artistUsername,
    trackCount: dto.trackCount,
  }
}

export function toSubmissionReview(dto: ReleaseReviewDto): SubmissionReview {
  return {
    id: dto.id,
    decision: TO_DOMAIN_DECISION[dto.decision],
    message: dto.message,
    requiredChanges: dto.requiredChanges,
    recommendations: dto.recommendations,
    createdAt: new Date(dto.createdAt),
    reviewerUsername: dto.reviewerUsername,
  }
}

export function toReleaseSubmissionDetail(dto: ReleaseDetailDto): ReleaseSubmissionDetail {
  return {
    ...toReleaseSubmission(dto),
    upc: dto.upc,
    scheduledAt: toDate(dto.scheduledAt),
    masterOwnerType: dto.rights.masterOwnerType,
    masterOwnerName: dto.rights.masterOwnerName,
    writersConfirmedAt: toDate(dto.rights.writersConfirmedAt),
    accuracyConfirmedAt: toDate(dto.rights.accuracyConfirmedAt),
    tracks: dto.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      durationSeconds: track.duration,
      isrc: track.isrc,
      audioFileName: track.audioFileName,
      hasAudio: track.hasAudio,
    })),
    contributors: dto.contributors.map((person) => ({
      id: person.id,
      displayName: person.displayName,
      roles: [...person.roles],
    })),
    splits: dto.splits.map((split) => ({ ...split })),
    territories: dto.territories,
    destinations: [...dto.destinations],
    blockerCodes: dto.readiness.blockers.map((item) => item.code),
    noticeCodes: dto.readiness.notices.map((item) => item.code),
    reviews: dto.reviews.map(toSubmissionReview),
  }
}
