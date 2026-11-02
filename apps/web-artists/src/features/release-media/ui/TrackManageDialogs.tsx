import { Button, Input } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useRemoveTrack,
  useRenameTrack,
} from '@entities/release'
import { Interpolate, type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'

const MAX_TITLE_LENGTH = 255

interface TrackDialogProps {
  artistId: string
  release: ReleaseWorkspace
  trackId: string
  onClose: () => void
  onSaved: () => void
}

export function RenameTrackDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackDialogProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const rename = useRenameTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const track = release.trackDrafts.find((item) => item.id === trackId)
  const [title, setTitle] = useState(track?.title ?? '')
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const unchanged = title.trim() === track?.title

  const submit = async () => {
    const trimmed = title.trim()
    if (trimmed === '') {
      setProblem('media.enterTitle')
      return
    }
    try {
      await rename.mutateAsync({
        id: release.id,
        trackId,
        title: trimmed,
        expectedUpdatedAt,
      })
      onSaved()
    } catch {
      // Keep the entered title when the write is rejected or unconfirmed.
    }
  }

  return (
    <WorkspaceModal
      canClose={!rename.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('media.renameTitle')}
    >
      <form
        aria-busy={rename.isPending}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
            {t('media.trackTitle')}
          </label>
          <Input
            aria-describedby={problem ? `${id}-error` : undefined}
            aria-invalid={Boolean(problem)}
            autoComplete="off"
            data-initial-focus
            disabled={rename.isPending}
            id={`${id}-title`}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => {
              setProblem(null)
              rename.reset()
              setTitle(event.target.value)
            }}
            value={title}
          />
          {problem && (
            <p
              className="text-sm text-destructive"
              id={`${id}-error`}
              role="alert"
            >
              {t(problem)}
            </p>
          )}
        </div>
        {rename.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(rename.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={rename.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={rename.isPending || unchanged}
            type="submit"
            variant="primary"
          >
            {rename.isPending ? t('common.saving') : t('media.saveTitle')}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}

export function RemoveTrackDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackDialogProps) {
  const { t, tMessage } = useI18n()
  const remove = useRemoveTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const track = release.trackDrafts.find((item) => item.id === trackId)

  const confirm = async () => {
    try {
      await remove.mutateAsync({ id: release.id, trackId, expectedUpdatedAt })
      onSaved()
    } catch {
      // The recording stays; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('media.removeTitle')}
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          <Interpolate
            message={t('media.removeConfirm')}
            values={{
              title: (
                <strong>
                  {track?.title ?? t('editRelease.thisRecording')}
                </strong>
              ),
            }}
          />
        </p>
        {remove.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(remove.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            data-initial-focus
            disabled={remove.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('media.keepTrack')}
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending
              ? t('editRelease.removing')
              : t('media.removeTitle')}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
