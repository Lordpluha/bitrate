import type { I18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import type { ReleaseWorkspace } from './workspace.schema'

type RoadmapState = 'done' | 'current' | 'todo' | 'later'

interface RoadmapStep {
  key:
    | 'details'
    | 'timing'
    | 'artwork'
    | 'audio'
    | 'credits'
    | 'rights'
    | 'submit'
    | 'review'
    | 'delivery'
  label: string
  state: RoadmapState
  /** What is left, or what the finished step recorded. */
  detail: string
  /** Workspace section that resolves this step. */
  anchor?: string
}

const AFTER_REVIEW = new Set(['READY', 'RELEASED'])

/**
 * The path from a draft to a delivered release, derived only from saved data so it always
 * reflects the real stage. Preparation steps can finish in any order; the first unfinished
 * one is marked current while the release is a draft.
 */
export function releaseRoadmap(
  release: ReleaseWorkspace,
  { t, tp, locale }: Pick<I18n, 't' | 'tp' | 'locale'>,
): RoadmapStep[] {
  const blockers = release.readiness.blockers
  const has = (code: (typeof blockers)[number]['code']) =>
    blockers.some((blocker) => blocker.code === code)
  const trackTotal = release.trackDrafts.length + release.tracks.length
  const missingAudio = blockers.filter(
    (blocker) => blocker.code === 'TRACK_AUDIO_MISSING',
  ).length
  const submitted = release.status !== 'DRAFT'
  const reviewed = AFTER_REVIEW.has(release.status)

  const preparation: Omit<RoadmapStep, 'state'>[] = [
    {
      key: 'details',
      label: t('release.roadmap.details'),
      detail: t('release.roadmap.detailsDone'),
    },
    {
      key: 'timing',
      label: t('release.roadmap.timing'),
      detail: release.scheduledAt
        ? t('release.roadmap.premiere', {
            date: formatDateTimeUtc(release.scheduledAt, locale),
          })
        : t('release.roadmap.rightAway'),
    },
    {
      key: 'artwork',
      label: t('release.roadmap.artwork'),
      detail: release.cover
        ? t('release.roadmap.artworkDone')
        : t('release.roadmap.artworkTodo'),
      anchor: 'release-preparation-heading',
    },
    {
      key: 'audio',
      label: t('release.roadmap.audio'),
      detail:
        trackTotal === 0
          ? t('release.roadmap.audioFirst')
          : missingAudio > 0
            ? tp({ count: missingAudio, key: 'release.roadmap.audioMissing' })
            : tp({ count: trackTotal, key: 'release.roadmap.audioDone' }),
      anchor: 'release-tracks-heading',
    },
    {
      key: 'credits',
      label: t('release.roadmap.credits'),
      detail:
        has('CONTRIBUTOR_ROLES_MISSING') || has('SPLITS_INCOMPLETE')
          ? t('release.roadmap.creditsTodo')
          : t('release.roadmap.creditsDone'),
      anchor: 'release-credits-heading',
    },
    {
      key: 'rights',
      label: t('release.roadmap.rights'),
      detail:
        has('MASTER_OWNER_MISSING') || has('WRITERS_NOT_CONFIRMED')
          ? t('release.roadmap.rightsTodo')
          : t('release.roadmap.rightsDone'),
      anchor: 'release-rights-heading',
    },
  ]
  const preparationDone: Record<string, boolean> = {
    details: true,
    // Right away is a valid choice, so timing never blocks preparation.
    timing: true,
    artwork: !has('COVER_MISSING'),
    audio: !has('NO_TRACKS') && missingAudio === 0,
    credits: !has('CONTRIBUTOR_ROLES_MISSING') && !has('SPLITS_INCOMPLETE'),
    rights: !has('MASTER_OWNER_MISSING') && !has('WRITERS_NOT_CONFIRMED'),
  }

  let currentAssigned = submitted
  const steps: RoadmapStep[] = preparation.map((step) => {
    if (submitted || preparationDone[step.key])
      return { ...step, state: 'done' }
    if (!currentAssigned) {
      currentAssigned = true
      return { ...step, state: 'current' }
    }
    return { ...step, state: 'todo' }
  })

  steps.push({
    key: 'submit',
    label: t('release.roadmap.submit'),
    state: submitted ? 'done' : currentAssigned ? 'todo' : 'current',
    detail: submitted
      ? t('release.roadmap.submitted')
      : blockers.length > 0
        ? tp({ count: blockers.length, key: 'release.roadmap.blockersLeft' })
        : t('release.roadmap.submitTodo'),
    anchor: 'release-readiness-heading',
  })
  steps.push({
    key: 'review',
    label: t('release.roadmap.review'),
    state: reviewed
      ? 'done'
      : release.status === 'SUBMITTED'
        ? 'current'
        : release.status === 'REJECTED'
          ? 'current'
          : 'todo',
    detail:
      release.status === 'REJECTED'
        ? t('release.roadmap.changesRequested')
        : reviewed
          ? t('release.roadmap.approved')
          : release.status === 'SUBMITTED'
            ? t('release.roadmap.waiting')
            : t('release.roadmap.afterSubmission'),
  })
  steps.push({
    key: 'delivery',
    label: t('release.roadmap.delivery'),
    state: release.status === 'RELEASED' ? 'done' : 'later',
    detail:
      release.status === 'RELEASED'
        ? t('release.roadmap.released')
        : t('release.roadmap.deliverySoon'),
  })
  return steps
}
