import {
  describeBlocker,
  type ReleaseNotice,
  type ReleaseWorkspace,
} from '@entities/release'
import { ReleaseSubmission } from '@features/submit-release'
import { type Translate, useI18n } from '@shared/i18n'
import { CircleAlert, Info } from 'lucide-react'

interface WorkspaceReadinessProps {
  artistId: string
  release: ReleaseWorkspace
}

function describeNotice(
  notice: ReleaseNotice,
  release: ReleaseWorkspace,
  t: Translate,
) {
  if (notice.code === 'UPC_MISSING') return t('workspace.readiness.noUpc')
  const track = release.trackDrafts.find((item) => item.id === notice.trackId)
  return t('workspace.readiness.noIsrc', {
    title: track?.title ?? t('workspace.readiness.aRecording'),
  })
}

export function WorkspaceReadiness({
  artistId,
  release,
}: WorkspaceReadinessProps) {
  const { blockers, notices } = release.readiness
  const { t, tp } = useI18n()
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
          {blockers.length === 0
            ? t('workspace.readiness.ready')
            : t('workspace.readiness.before')}
        </h2>
        <span className="artist-release-submit-count">
          {tp({ count: blockers.length, key: 'workspace.readiness.blockers' })}
        </span>
      </div>
      <p>
        {blockers.length === 0
          ? t('workspace.readiness.complete')
          : t('workspace.readiness.resolve')}
      </p>
      {blockers.length > 0 && (
        <ul
          aria-label={t('workspace.readiness.blockersLabel')}
          className="artist-release-submit-list"
        >
          {blockers.map((blocker) => (
            <li
              key={`${blocker.code}-${'contributorId' in blocker ? blocker.contributorId : ''}${'rightType' in blocker ? blocker.rightType : ''}${'trackId' in blocker ? blocker.trackId : ''}`}
            >
              <CircleAlert aria-hidden="true" />
              {describeBlocker(blocker, { contributors, tracks }, t)}
            </li>
          ))}
        </ul>
      )}
      {notices.length > 0 && (
        <ul
          aria-label={t('workspace.readiness.notesLabel')}
          className="artist-release-submit-list"
          data-tone="info"
        >
          {notices.map((notice) => (
            <li
              key={`${notice.code}-${'trackId' in notice ? notice.trackId : ''}`}
            >
              <Info aria-hidden="true" />
              {describeNotice(notice, release, t)}
            </li>
          ))}
        </ul>
      )}
      <ReleaseSubmission artistId={artistId} release={release} />
    </section>
  )
}
