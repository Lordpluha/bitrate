import type { TranslationKey } from '@shared/i18n'
import type { ReleaseSummary } from './release.schema'

type Status = ReleaseSummary['status']

/** The four stages a release passes through; each one is a screen of the workspace. */
export const releaseStages = ['draft', 'review', 'deliver', 'launch'] as const

export type ReleaseStage = (typeof releaseStages)[number]

/** `optional`: open to the artist after approval, but never required to finish. */
export type StageProgress = 'complete' | 'current' | 'optional' | 'upcoming'

/** Catalog keys; render them with `t()`. */
export const releaseStageLabels = {
  draft: 'release.stage.draft',
  review: 'release.stage.review',
  deliver: 'release.stage.deliver',
  launch: 'release.stage.launch',
} satisfies Record<ReleaseStage, TranslationKey>

/** Catalog keys; render them with `t()`. */
export const stageProgressLabels = {
  complete: 'release.progress.complete',
  current: 'release.progress.current',
  optional: 'release.progress.optional',
  upcoming: 'release.progress.upcoming',
} satisfies Record<StageProgress, TranslationKey>

/** Approved but not live: the artist publishes on Launch. */
const approved = {
  draft: 'complete',
  review: 'complete',
  deliver: 'optional',
  launch: 'current',
} as const satisfies Record<ReleaseStage, StageProgress>

/** Live once, whether or not it is online now. */
const live = {
  draft: 'complete',
  review: 'complete',
  deliver: 'complete',
  launch: 'current',
} as const satisfies Record<ReleaseStage, StageProgress>

const progressByStatus: Record<Status, Record<ReleaseStage, StageProgress>> = {
  DRAFT: {
    draft: 'current',
    review: 'upcoming',
    deliver: 'upcoming',
    launch: 'upcoming',
  },
  SUBMITTED: {
    draft: 'complete',
    review: 'current',
    deliver: 'upcoming',
    launch: 'upcoming',
  },
  REJECTED: {
    draft: 'complete',
    review: 'current',
    deliver: 'upcoming',
    launch: 'upcoming',
  },
  // Approval opens publishing on Launch; delivery stays optional throughout.
  READY: approved,
  SCHEDULED: approved,
  PUBLISHING: approved,
  PUBLISH_FAILED: approved,
  RELEASED: live,
  UNPUBLISHED: live,
}

const stageByStatus: Record<Status, ReleaseStage> = {
  DRAFT: 'draft',
  SUBMITTED: 'review',
  REJECTED: 'review',
  READY: 'launch',
  SCHEDULED: 'launch',
  PUBLISHING: 'launch',
  PUBLISH_FAILED: 'launch',
  RELEASED: 'launch',
  UNPUBLISHED: 'launch',
}

/** Where each stage stands for a release in `status`; derived only from saved data. */
export function stageProgress(
  status: Status,
): Record<ReleaseStage, StageProgress> {
  return progressByStatus[status]
}

/** The stage a release opens on when the URL names none. */
export function currentStage(status: Status): ReleaseStage {
  return stageByStatus[status]
}
