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
  return (
    <section
      aria-labelledby="release-readiness-heading"
      className="artist-release-workspace-panel artist-release-readiness"
    >
      <h2 id="release-readiness-heading">Readiness checklist</h2>
      <p>
        {blockers.length === 0
          ? 'Ready for review · 0 blockers'
          : `${blockers.length} ${blockers.length === 1 ? 'blocker' : 'blockers'} before review`}
      </p>
      {blockers.length > 0 && (
        <ul aria-label="Blockers" className="space-y-1 text-sm">
          {blockers.map((blocker) => (
            <li
              className="flex items-center gap-2"
              key={`${blocker.code}-${'contributorId' in blocker ? blocker.contributorId : ''}${'rightType' in blocker ? blocker.rightType : ''}`}
            >
              <CircleAlert
                aria-hidden="true"
                className="size-4 shrink-0 text-destructive"
              />
              {describeBlocker(blocker, { contributors })}
            </li>
          ))}
        </ul>
      )}
      {notices.length > 0 && (
        <ul aria-label="Notes" className="space-y-1 text-sm">
          {notices.map((notice) => (
            <li
              className="flex items-center gap-2"
              key={`${notice.code}-${'trackId' in notice ? notice.trackId : ''}`}
            >
              <Info
                aria-hidden="true"
                className="size-4 shrink-0 text-accent"
              />
              {describeNotice(notice, release)}
            </li>
          ))}
        </ul>
      )}
      <ReleaseSubmission artistId={artistId} release={release} />
    </section>
  )
}
