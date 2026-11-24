import type { TranslationKey } from '@shared/i18n'
import type { ReleaseSummary } from './release.schema'

type Status = ReleaseSummary['status']

/** The stages every release passes through, in order; the progress ring counts these. */
export const releasePipeline = ['draft', 'review', 'deliver', 'launch'] as const

/**
 * Every screen of the release workspace. Promotion is optional at every status and shows only
 * for artists with AI promotion enabled.
 */
export const releaseStages = [...releasePipeline, 'promotion'] as const

export type ReleaseStage = (typeof releaseStages)[number]
export type PipelineStage = (typeof releasePipeline)[number]

/** `optional`: open to the artist after approval, but never required to finish. */
export type StageProgress = 'complete' | 'current' | 'optional' | 'upcoming'

/** Catalog keys; render them with `t()`. */
export const releaseStageLabels = {
  draft: 'release.stage.draft',
  review: 'release.stage.review',
  deliver: 'release.stage.deliver',
  launch: 'release.stage.launch',
  promotion: 'release.stage.promotion',
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
  promotion: 'optional',
} as const satisfies Record<ReleaseStage, StageProgress>

/** Live once, whether or not it is online now. */
const live = {
  draft: 'complete',
  review: 'complete',
  deliver: 'complete',
  launch: 'current',
  promotion: 'optional',
} as const satisfies Record<ReleaseStage, StageProgress>

const progressByStatus: Record<Status, Record<ReleaseStage, StageProgress>> = {
  DRAFT: {
    draft: 'current',
    review: 'upcoming',
    deliver: 'upcoming',
    launch: 'upcoming',
    promotion: 'optional',
  },
  SUBMITTED: {
    draft: 'complete',
    review: 'current',
    deliver: 'upcoming',
    launch: 'upcoming',
    promotion: 'optional',
  },
  REJECTED: {
    draft: 'complete',
    review: 'current',
    deliver: 'upcoming',
    launch: 'upcoming',
    promotion: 'optional',
  },
  // Approval opens publishing on Launch; delivery stays optional throughout.
  READY: approved,
  SCHEDULED: approved,
  PUBLISHING: approved,
  PUBLISH_FAILED: approved,
  RELEASED: live,
  UNPUBLISHED: live,
}

const stageByStatus: Record<Status, PipelineStage> = {
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
export function currentStage(status: Status): PipelineStage {
  return stageByStatus[status]
}
