import { Button, Input } from '@bitrate/ui-react'
import {
  AUDIO_ACCEPT,
  audioFileProblem,
  type ReleaseWorkspace,
  titleFromFileName,
  useUploadTrack,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { MediaFilePicker, UploadProgress } from './MediaFilePicker'

const MAX_TITLE_LENGTH = 255

interface TrackUploadDialogProps {
  artistId: string
  release: ReleaseWorkspace
  /** Replaces this recording's master; omitted to add a new recording. */
  trackId?: string
  onClose: () => void
  onSaved: () => void
}

/** Uploads a master; the title defaults to the file name and can be edited before saving. */
export function TrackUploadDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackUploadDialogProps) {
  const id = useId()
  const upload = useUploadTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const existing = trackId
    ? release.trackDrafts.find((track) => track.id === trackId)
    : undefined
  const replacing = trackId !== undefined
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [titleProblem, setTitleProblem] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const pending = upload.isPending

  const submit = async () => {
    if (!file) {
      setProblem('Choose an audio file to upload.')
      return
    }
    const fileProblem = audioFileProblem(file)
    if (fileProblem) {
      setProblem(fileProblem)
      return
    }
    const trimmed = title.trim()
    if (!replacing && trimmed === '') {
      setTitleProblem('Enter a title for this recording.')
      return
    }
    setProgress(0)
    try {
      await upload.mutateAsync({
        id: release.id,
        trackId,
        title: replacing ? undefined : trimmed,
        file,
        expectedUpdatedAt,
        onProgress: setProgress,
      })
      onSaved()
    } catch {
      // The file and title stay so the artist can retry after reading the error.
    } finally {
      setProgress(null)
    }
  }

  return (
    <WorkspaceModal
      canClose={!pending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={replacing ? 'Replace audio' : 'Upload track'}
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
        {replacing && (
          <p className="text-sm text-text-secondary">
            {existing?.hasAudio
              ? `The current file${existing.audioFileName ? ` (${existing.audioFileName})` : ''} of ${existing.title} is replaced once the new one is saved.`
              : `Add the master for ${existing?.title ?? 'this recording'}.`}
          </p>
        )}
        <MediaFilePicker
          accept={AUDIO_ACCEPT}
          disabled={pending}
          file={file}
          hint="WAV or FLAC masters are preferred; MP3 and OGG are accepted. Up to 512 MB. The file stays private to your workspace."
          label="Audio file"
          onChange={(next) => {
            setProblem(next ? audioFileProblem(next) : null)
            upload.reset()
            setFile(next)
            if (next && !replacing && !titleTouched) {
              setTitle(titleFromFileName(next.name))
              setTitleProblem(null)
            }
          }}
          problem={problem}
        />
        {!replacing && (
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-title`}
            >
              Track title
            </label>
            <Input
              aria-describedby={titleProblem ? `${id}-title-error` : undefined}
              aria-invalid={Boolean(titleProblem)}
              autoComplete="off"
              disabled={pending}
              id={`${id}-title`}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(event) => {
                setTitleTouched(true)
                setTitleProblem(null)
                upload.reset()
                setTitle(event.target.value)
              }}
              value={title}
            />
            {titleProblem && (
              <p
                className="text-sm text-destructive"
                id={`${id}-title-error`}
                role="alert"
              >
                {titleProblem}
              </p>
            )}
          </div>
        )}
        <UploadProgress fraction={progress} />
        {upload.error && (
          <p className="text-sm text-destructive" role="alert">
            {upload.error.message}
          </p>
        )}
        <p className="text-sm text-text-secondary">
          Uploading changes the track list, so you will confirm accuracy again
          before review.
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={pending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={pending || !file}
            type="submit"
            variant="primary"
          >
            {pending
              ? 'Uploading…'
              : replacing
                ? 'Replace audio'
                : 'Upload track'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
