import {
  describeBlocker,
  type ReleaseNotice,
  type ReleaseWorkspace,
} from '@entities/release'
import { ReleaseSubmission } from '@features/submit-release'
import { CircleAlert, Info } from 'lucide-react'

interface WorkspaceReadinessProps {
  artistId: string
  release: ReleaseWorkspace
}

function describeNotice(notice: ReleaseNotice, release: ReleaseWorkspace) {
  if (notice.code === 'UPC_MISSING')
    return 'No UPC yet — a code is needed before delivery'
  const track = release.trackDrafts.find((item) => item.id === notice.trackId)
  return `${track?.title ?? 'A recording'} has no ISRC yet — a code is needed before delivery`
}

export function WorkspaceReadiness({
  artistId,
  release,
}: WorkspaceReadinessProps) {
  const { blockers, notices } = release.readiness
  const contributors = Object.fromEntries(
    release.participants.map((person) => [person.id, person.displayName]),
  )
  const tracks = Object.fromEntries(
    release.trackDrafts.map((track) => [track.id, track.title]),
  )
  return (
    <section
      aria-labelledby="release-submit-heading"
      className="artist-release-workspace-panel artist-release-stage-side artist-release-submit"
      data-tone={blockers.length === 0 ? 'success' : undefined}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="release-submit-heading">
          {blockers.length === 0 ? 'Ready for review' : 'Before review'}
        </h2>
        <span className="artist-release-submit-count">
          {blockers.length} {blockers.length === 1 ? 'blocker' : 'blockers'}
        </span>
      </div>
      <p>
        {blockers.length === 0
          ? 'Every required step is complete.'
          : 'Resolve these before submitting.'}
      </p>
      {blockers.length > 0 && (
        <ul aria-label="Blockers" className="artist-release-submit-list">
          {blockers.map((blocker) => (
            <li
              key={`${blocker.code}-${'contributorId' in blocker ? blocker.contributorId : ''}${'rightType' in blocker ? blocker.rightType : ''}${'trackId' in blocker ? blocker.trackId : ''}`}
            >
              <CircleAlert aria-hidden="true" />
              {describeBlocker(blocker, { contributors, tracks })}
            </li>
          ))}
        </ul>
      )}
      {notices.length > 0 && (
        <ul
          aria-label="Notes"
          className="artist-release-submit-list"
          data-tone="info"
        >
          {notices.map((notice) => (
            <li
              key={`${notice.code}-${'trackId' in notice ? notice.trackId : ''}`}
            >
              <Info aria-hidden="true" />
              {describeNotice(notice, release)}
            </li>
          ))}
        </ul>
      )}
      <ReleaseSubmission artistId={artistId} release={release} />
    </section>
  )
}
