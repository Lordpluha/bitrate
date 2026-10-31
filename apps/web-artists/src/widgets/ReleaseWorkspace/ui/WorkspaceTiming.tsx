import { Button } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { LockedButton } from '@shared/ui'
import { CalendarDays } from 'lucide-react'
import { editLockReason } from '../lib/locks'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceTimingProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

/** When the release goes live: right away or a premiere. Editable in the draft and after approval. */
export function WorkspaceTiming({ release, onAction }: WorkspaceTimingProps) {
  const { t, locale } = useI18n()
  const editable = release.status === 'DRAFT' || release.status === 'READY'
  const lock = editLockReason(release.status)
  return (
    <section
      aria-labelledby="release-timing-heading"
      className="artist-release-workspace-panel artist-release-timing"
    >
      <span aria-hidden="true" className="artist-release-next-icon">
        <CalendarDays />
      </span>
      <div className="min-w-0">
        <h2 id="release-timing-heading">{t('release.roadmap.timing')}</h2>
        <p className="artist-release-timing-value">
          {release.scheduledAt
            ? t('delivery.dateUtc', {
                date: formatDateTimeUtc(release.scheduledAt, locale),
              })
            : t('editRelease.rightAway')}
        </p>
        <p>
          {release.scheduledAt
            ? t('delivery.premiereHint')
            : t('editRelease.rightAwayHint')}
        </p>
      </div>
      {editable ? (
        <Button
          onClick={() => onAction({ kind: 'schedule' })}
          size="sm"
          variant="outline"
        >
          {t('workspace.draft.editTiming')}
        </Button>
      ) : (
        lock && (
          <LockedButton reason={t(lock)} size="sm" variant="outline">
            {t('workspace.draft.editTiming')}
          </LockedButton>
        )
      )}
    </section>
  )
}
