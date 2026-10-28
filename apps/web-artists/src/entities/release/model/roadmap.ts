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

const premiere = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

/**
 * The path from a draft to a delivered release, derived only from saved data so it always
 * reflects the real stage. Preparation steps can finish in any order; the first unfinished
 * one is marked current while the release is a draft.
 */
export function releaseRoadmap(release: ReleaseWorkspace): RoadmapStep[] {
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
      label: 'Release details',
      detail: 'Title and type saved',
    },
    {
      key: 'timing',
      label: 'Release timing',
      detail: release.scheduledAt
        ? `Premiere · ${premiere.format(new Date(release.scheduledAt))} UTC`
        : 'Right away, as soon as you publish it',
    },
    {
      key: 'artwork',
      label: 'Artwork',
      detail: release.cover ? 'Artwork uploaded' : 'Upload the cover image',
      anchor: 'release-preparation-heading',
    },
    {
      key: 'audio',
      label: 'Tracks and audio',
      detail:
        trackTotal === 0
          ? 'Upload the first track'
          : missingAudio > 0
            ? `${missingAudio} ${missingAudio === 1 ? 'track needs' : 'tracks need'} audio`
            : `${trackTotal} ${trackTotal === 1 ? 'track' : 'tracks'} with audio`,
      anchor: 'release-tracks-heading',
    },
    {
      key: 'credits',
      label: 'Credits & splits',
      detail:
        has('CONTRIBUTOR_ROLES_MISSING') || has('SPLITS_INCOMPLETE')
          ? 'Credit everyone with a role and share out 100% of master and publishing'
          : 'Everyone credited · master and publishing at 100%',
      anchor: 'release-credits-heading',
    },
    {
      key: 'rights',
      label: 'Rights',
      detail:
        has('MASTER_OWNER_MISSING') || has('WRITERS_NOT_CONFIRMED')
          ? 'Choose the master owner and confirm the songwriters'
          : 'Master owner and songwriters confirmed',
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
    label: 'Confirm and submit',
    state: submitted ? 'done' : currentAssigned ? 'todo' : 'current',
    detail: submitted
      ? 'Sent for Bitrate review'
      : blockers.length > 0
        ? `${blockers.length} ${blockers.length === 1 ? 'blocker' : 'blockers'} left before review`
        : 'Confirm accuracy and submit for review',
    anchor: 'release-readiness-heading',
  })
  steps.push({
    key: 'review',
    label: 'Bitrate review',
    state: reviewed
      ? 'done'
      : release.status === 'SUBMITTED'
        ? 'current'
        : release.status === 'REJECTED'
          ? 'current'
          : 'todo',
    detail:
      release.status === 'REJECTED'
        ? 'Changes requested'
        : reviewed
          ? 'Approved'
          : release.status === 'SUBMITTED'
            ? 'Waiting for a reviewer'
            : 'Starts after submission',
  })
  steps.push({
    key: 'delivery',
    label: 'Delivery to stores',
    state: release.status === 'RELEASED' ? 'done' : 'later',
    detail:
      release.status === 'RELEASED'
        ? 'Released'
        : 'Store delivery is coming soon',
  })
  return steps
}
