import { Button } from '@bitrate/ui-react'
import { trackVersionLabels } from '@entities/music'
import {
  basisPointsToPercent,
  participantRoleLabels,
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseTypeLabels,
  useSubmitRelease,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { formatDuration } from '@shared/lib/format'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { CalendarDays, CircleAlert, CircleCheck, Music2 } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'

interface SubmitPreviewDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  /** Runs after Bitrate accepted the submission, e.g. to open the Review stage. */
  onSubmitted?: () => void
}

function PreviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="artist-submit-preview-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

/**
 * Everything Bitrate will review, in one read-only summary, with the accuracy confirmation and
 * the submit action at the end. Fixing anything means going back to the draft.
 */
export function SubmitPreviewDialog({
  artistId,
  release,
  onClose,
  onSubmitted,
}: SubmitPreviewDialogProps) {
  const { t, tMessage, tp, locale } = useI18n()
  const id = useId()
  const submit = useSubmitRelease(artistId)
  const [reviewed, setReviewed] = useState(false)
  const busy = submit.isPending
  const masterShare = (contributorId: string) =>
    release.splits.find(
      (split) =>
        split.contributorId === contributorId &&
        split.rightType === 'RECORDING',
    )?.shareBasisPoints ?? 0
  const owner =
    release.rights.masterOwnerType === 'ARTIST'
      ? t('workspace.rights.thisArtist', { name: release.artistName })
      : release.rights.masterOwnerName
  const send = async () => {
    try {
      await submit.mutateAsync({
        id: release.id,
        input: { reviewed: true, expectedUpdatedAt: release.updatedAt },
      })
      onClose()
      onSubmitted?.()
    } catch {
      // The error is shown below; the confirmation stays checked for a retry.
    }
  }

  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal artist-submit-preview max-w-2xl"
      onClose={onClose}
      title={t('publish.preview.title')}
    >
      <form
        aria-busy={busy}
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <p className="text-sm text-text-secondary">
          {t('publish.preview.intro')}
        </p>

        <div className="artist-submit-preview-identity">
          {release.cover ? (
            <img
              alt={t('workspace.artworkAlt', { title: release.title })}
              src={releaseCoverUrl(release.cover)}
            />
          ) : (
            <span className="artist-submit-preview-cover-empty">
              <Music2 aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <span className="block truncate text-lg text-foreground">
              {release.title}
            </span>
            <span className="block text-sm text-text-secondary">
              {release.artistName} · {t(releaseTypeLabels[release.type])} ·{' '}
              {tp({ count: release.trackCount, key: 'common.tracks' })}
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
              <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
              {release.scheduledAt
                ? t('release.roadmap.premiere', {
                    date: formatDateTimeUtc(release.scheduledAt, locale),
                  })
                : t('release.roadmap.rightAway')}
            </span>
          </div>
        </div>

        <PreviewSection title={t('publish.preview.tracks')}>
          <ol className="artist-submit-preview-list">
            {release.trackDrafts.map((track, index) => (
              <li key={track.id}>
                <span className="artist-submit-preview-index">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-foreground">
                    {track.title}
                  </span>
                  <span className="block text-xs text-text-secondary">
                    {t(trackVersionLabels[track.version])} ·{' '}
                    {track.duration === null
                      ? '—'
                      : formatDuration(track.duration)}{' '}
                    · {track.isrc ?? t('publish.preview.noIsrc')}
                  </span>
                </span>
                {track.hasAudio ? (
                  <CircleCheck
                    aria-label={t('publish.preview.audioReady')}
                    className="artist-submit-preview-ok"
                  />
                ) : (
                  <CircleAlert
                    aria-label={t('publish.preview.noAudio')}
                    className="artist-submit-preview-warn"
                  />
                )}
              </li>
            ))}
          </ol>
        </PreviewSection>

        <PreviewSection title={t('publish.preview.credits')}>
          <ul className="artist-submit-preview-list">
            {release.participants.map((person) => (
              <li key={person.id}>
                <span className="min-w-0">
                  <span className="block truncate text-foreground">
                    {person.displayName}
                  </span>
                  <span className="block text-xs text-text-secondary">
                    {person.roles
                      .map((role) => t(participantRoleLabels[role]))
                      .join(' · ')}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-foreground">
                  {basisPointsToPercent(masterShare(person.id))}%
                </span>
              </li>
            ))}
          </ul>
        </PreviewSection>

        <div className="grid gap-5 sm:grid-cols-2">
          <PreviewSection title={t('publish.preview.owner')}>
            <span className="block text-sm text-foreground">
              {owner ?? '—'}
            </span>
          </PreviewSection>
          <PreviewSection title={t('publish.preview.identifiers')}>
            <span className="block text-sm text-foreground">
              UPC/EAN:{' '}
              {release.upc ?? (
                <span className="text-text-secondary">
                  {t('workspace.rights.notProvided')}
                </span>
              )}
            </span>
          </PreviewSection>
        </div>

        <label className="artist-release-credit-role">
          <input
            aria-describedby={`${id}-hint`}
            checked={reviewed}
            disabled={busy}
            onChange={(event) => {
              submit.reset()
              setReviewed(event.target.checked)
            }}
            type="checkbox"
          />
          <span>{t('publish.confirmAccurate')}</span>
        </label>
        <p className="text-xs text-text-secondary" id={`${id}-hint`}>
          {t('workspace.draft.honest')}
        </p>
        {submit.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(submit.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={busy}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('publish.preview.back')}
          </Button>
          <Button
            className="artist-workspace-primary rounded-full"
            disabled={busy || !reviewed}
            type="submit"
            variant="primary"
          >
            {busy ? t('publish.submitting') : t('publish.submit')}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
