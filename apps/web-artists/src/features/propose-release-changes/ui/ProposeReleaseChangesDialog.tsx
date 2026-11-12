import { Input, toast } from '@bitrate/ui-react'
import {
  COVER_ACCEPT,
  coverFileProblem,
  releaseCoverUrl,
  useReleaseChanges,
  useSubmitReleaseChanges,
} from '@entities/release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceFormModal } from '@shared/ui/WorkspaceFormModal/WorkspaceFormModal'
import { useEffect, useId, useMemo, useState } from 'react'
import { buildProposal } from '../model/proposal'

export interface ProposeReleaseChangesDialogProps {
  artistId: string
  release: { id: string; title: string; cover: string | null }
  /** Recordings first published in this release; compilation reuses are renamed elsewhere. */
  recordings: { id: string; title: string }[]
  onClose: () => void
  onSent?: () => void
}

/** Proposes a new title, cover and recording titles for a live release in one request. */
export function ProposeReleaseChangesDialog({
  artistId,
  release,
  recordings,
  onClose,
  onSent,
}: ProposeReleaseChangesDialogProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const submit = useSubmitReleaseChanges(artistId)
  const changes = useReleaseChanges(artistId, release.id)
  const [title, setTitle] = useState(release.title)
  const [recordingTitles, setRecordingTitles] = useState<
    Record<string, string>
  >({})
  const [cover, setCover] = useState<File | undefined>()
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const preview = useMemo(
    () => (cover ? URL.createObjectURL(cover) : null),
    [cover],
  )
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )
  const pending = new Set(
    (changes.data ?? [])
      .filter((change) => change.status === 'PENDING')
      .map((change) => change.recordingId ?? change.field),
  )
  const titlePending = pending.has('RELEASE_TITLE')
  const coverPending = pending.has('RELEASE_COVER')

  return (
    <WorkspaceFormModal
      error={submit.error}
      onClose={onClose}
      onSubmit={async () => {
        if (submit.isPending) return
        const result = buildProposal(
          { title: release.title, recordings },
          { title, recordings: recordingTitles, cover },
        )
        if (!result.ok) {
          setProblem(result.error)
          return
        }
        setProblem(null)
        try {
          await submit.mutateAsync({ id: release.id, ...result.proposal })
          toast.success(t('releaseChanges.sent'))
          onSent?.()
          onClose()
        } catch {
          // The modal shows why; the values stay for another try.
        }
      }}
      pending={submit.isPending}
      pendingLabel={t('releaseChanges.dialog.sending')}
      submitLabel={t('releaseChanges.dialog.submit')}
      title={t('releaseChanges.dialog.title', { title: release.title })}
    >
      <p className="text-sm text-text-secondary">
        {t('releaseChanges.dialog.intro')}
      </p>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
          {t('releaseChanges.dialog.releaseTitle')}
        </label>
        <Input
          aria-describedby={titlePending ? `${id}-title-pending` : undefined}
          disabled={titlePending || submit.isPending}
          id={`${id}-title`}
          maxLength={255}
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        {titlePending && (
          <p className="text-xs text-text-secondary" id={`${id}-title-pending`}>
            {t('releaseChanges.dialog.pendingField')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-cover`}>
          {t('releaseChanges.dialog.cover')}
        </label>
        <div className="flex items-center gap-3">
          {(preview ?? release.cover) && (
            <img
              alt=""
              className="size-16 shrink-0 rounded-lg object-cover"
              src={preview ?? releaseCoverUrl(release.cover ?? '')}
            />
          )}
          <input
            accept={COVER_ACCEPT}
            aria-describedby={`${id}-cover-hint`}
            className="min-w-0 text-sm"
            disabled={coverPending || submit.isPending}
            id={`${id}-cover`}
            onChange={(event) => {
              const file = event.target.files?.[0]
              const fileProblem = file ? coverFileProblem(file) : null
              setProblem(fileProblem)
              setCover(file && !fileProblem ? file : undefined)
            }}
            type="file"
          />
        </div>
        <p className="text-xs text-text-secondary" id={`${id}-cover-hint`}>
          {coverPending
            ? t('releaseChanges.dialog.pendingField')
            : t('releaseChanges.dialog.coverHint')}
        </p>
      </div>
      {recordings.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {t('releaseChanges.dialog.recordings')}
          </legend>
          <p className="text-xs text-text-secondary">
            {t('releaseChanges.dialog.recordingWarning')}
          </p>
          {recordings.map((recording) => {
            const recordingPending = pending.has(recording.id)
            return (
              <div className="space-y-1" key={recording.id}>
                <label
                  className="block text-xs text-text-secondary"
                  htmlFor={`${id}-${recording.id}`}
                >
                  {recording.title}
                </label>
                <Input
                  disabled={recordingPending || submit.isPending}
                  id={`${id}-${recording.id}`}
                  maxLength={255}
                  onChange={(event) =>
                    setRecordingTitles((current) => ({
                      ...current,
                      [recording.id]: event.target.value,
                    }))
                  }
                  value={recordingTitles[recording.id] ?? recording.title}
                />
                {recordingPending && (
                  <p className="text-xs text-text-secondary">
                    {t('releaseChanges.dialog.pendingField')}
                  </p>
                )}
              </div>
            )
          })}
        </fieldset>
      )}
      {problem && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(problem)}
        </p>
      )}
    </WorkspaceFormModal>
  )
}
