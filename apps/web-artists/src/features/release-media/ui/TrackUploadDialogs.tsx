import { Input } from '@bitrate/ui-react'
import { type ReleaseWorkspace, titleFromFileName } from '@entities/release'
import { useId, useState } from 'react'
import { useAudioUpload } from '../model/useAudioUpload'
import { AudioUploadForm } from './AudioUploadForm'

const MAX_TITLE_LENGTH = 255

interface TrackUploadDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

/** Uploads a new recording; the title defaults to the file name and can be edited before saving. */
export function AddTrackDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: TrackUploadDialogProps) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [titleProblem, setTitleProblem] = useState<string | null>(null)
  const audio = useAudioUpload(artistId, release, (file) => {
    if (titleTouched) return
    setTitle(titleFromFileName(file.name))
    setTitleProblem(null)
  })

  const submit = async () => {
    const file = audio.validFile()
    if (!file) return
    const trimmed = title.trim()
    if (trimmed === '') {
      setTitleProblem('Enter a title for this recording.')
      return
    }
    if (await audio.send(file, { title: trimmed })) onSaved()
  }

  return (
    <AudioUploadForm
      audio={audio}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Upload track"
      title="Upload track"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
          Track title
        </label>
        <Input
          aria-describedby={titleProblem ? `${id}-title-error` : undefined}
          aria-invalid={Boolean(titleProblem)}
          autoComplete="off"
          disabled={audio.pending}
          id={`${id}-title`}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => {
            setTitleTouched(true)
            setTitleProblem(null)
            audio.reset()
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
    </AudioUploadForm>
  )
}

interface ReplaceAudioDialogProps extends TrackUploadDialogProps {
  trackId: string
}

/** Replaces the master of one recording, keeping its title and metadata. */
export function ReplaceAudioDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: ReplaceAudioDialogProps) {
  const audio = useAudioUpload(artistId, release)
  const existing = release.trackDrafts.find((track) => track.id === trackId)

  const submit = async () => {
    const file = audio.validFile()
    if (file && (await audio.send(file, { trackId }))) onSaved()
  }

  return (
    <AudioUploadForm
      audio={audio}
      intro={
        <p className="text-sm text-text-secondary">
          {existing?.hasAudio
            ? `The current file${existing.audioFileName ? ` (${existing.audioFileName})` : ''} of ${existing.title} is replaced once the new one is saved.`
            : `Add the master for ${existing?.title ?? 'this recording'}.`}
        </p>
      }
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Replace audio"
      title="Replace audio"
    />
  )
}
