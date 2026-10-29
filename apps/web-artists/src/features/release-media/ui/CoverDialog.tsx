import { Button, cn } from '@bitrate/ui-react'
import {
  COVER_ACCEPT,
  coverFileProblem,
  type ReleaseWorkspace,
  releaseCoverUrl,
  useRemoveCover,
  useUploadCover,
} from '@entities/release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useEffect, useState } from 'react'
import { MediaFilePicker, UploadProgress, useFileDrop } from './MediaFilePicker'

interface CoverDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

/** Uploads, replaces or removes the release artwork; the saved cover stays until a write is confirmed. */
export function CoverDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: CoverDialogProps) {
  const { t, tMessage } = useI18n()
  const upload = useUploadCover(artistId)
  const remove = useRemoveCover(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const [file, setFile] = useState<File | null>(null)
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const pending = upload.isPending || remove.isPending
  const error = upload.error ?? remove.error

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shown =
    preview ?? (release.cover ? releaseCoverUrl(release.cover) : null)

  const choose = (next: File | null) => {
    setProblem(next ? coverFileProblem(next) : null)
    upload.reset()
    remove.reset()
    setFile(next)
  }
  const drop = useFileDrop(pending, choose)

  const submit = async () => {
    if (!file) {
      setProblem('media.chooseImage')
      return
    }
    const fileProblem = coverFileProblem(file)
    if (fileProblem) {
      setProblem(fileProblem)
      return
    }
    setProgress(0)
    try {
      await upload.mutateAsync({
        id: release.id,
        file,
        expectedUpdatedAt,
        onProgress: setProgress,
      })
      onSaved()
    } catch {
      // The chosen file stays selected so the artist can retry after reading the error.
    } finally {
      setProgress(null)
    }
  }

  const removeCover = async () => {
    try {
      await remove.mutateAsync({ id: release.id, expectedUpdatedAt })
      onSaved()
    } catch {
      // The current artwork is kept; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!pending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('media.artworkTitle')}
    >
      <form
        aria-busy={pending}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="flex justify-center" {...drop.handlers}>
          {shown ? (
            <img
              alt={
                file
                  ? t('media.previewAlt')
                  : t('workspace.artworkAlt', { title: release.title })
              }
              className={cn(
                'aspect-square w-48 rounded-lg border border-border object-cover',
                drop.over && 'border-accent',
              )}
              src={shown}
            />
          ) : (
            <div
              className={cn(
                'flex aspect-square w-48 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-text-secondary',
                drop.over && 'border-accent',
              )}
            >
              {t('media.noArtwork')}
            </div>
          )}
        </div>
        <MediaFilePicker
          accept={COVER_ACCEPT}
          disabled={pending}
          file={file}
          hint={t('media.coverHint')}
          label={t('media.artworkImage')}
          onChange={choose}
          problem={problem}
        />
        <UploadProgress fraction={progress} />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-3">
          {release.cover ? (
            <Button
              disabled={pending}
              onClick={() => {
                void removeCover()
              }}
              type="button"
              variant="ghost"
            >
              {remove.isPending
                ? t('editRelease.removing')
                : t('media.removeArtwork')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={pending}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="artist-workspace-primary"
              disabled={pending || !file}
              type="submit"
              variant="primary"
            >
              {upload.isPending ? t('media.uploading') : t('media.saveArtwork')}
            </Button>
          </div>
        </div>
      </form>
    </WorkspaceModal>
  )
}
