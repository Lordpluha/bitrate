import type { ReleaseNotice, ReleaseWorkspace } from '@entities/release'
import { ReleaseSubmission } from '@features/submit-release'
import { type Translate, useI18n } from '@shared/i18n'
import { Info } from 'lucide-react'

interface WorkspaceReadinessProps {
  artistId: string
  release: ReleaseWorkspace
  onReview: () => void
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

/** Notes that do not block review, then the submission itself. */
export function WorkspaceReadiness({
  artistId,
  release,
  onReview,
}: WorkspaceReadinessProps) {
  const { notices } = release.readiness
  const { t } = useI18n()
  return (
    <div className="artist-release-submit" id="release-submit-heading">
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
      <ReleaseSubmission
        artistId={artistId}
        onReview={onReview}
        release={release}
      />
    </div>
  )
}
