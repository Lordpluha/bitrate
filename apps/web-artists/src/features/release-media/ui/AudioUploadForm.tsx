import { cn } from '@bitrate/ui-react'
import { AUDIO_ACCEPT } from '@entities/release'
import { WorkspaceFormModal } from '@shared/ui/WorkspaceFormModal/WorkspaceFormModal'
import type { ReactNode } from 'react'
import type { AudioUpload } from '../model/useAudioUpload'
import { MediaFilePicker, UploadProgress, useFileDrop } from './MediaFilePicker'

interface AudioUploadFormProps {
  title: string
  submitLabel: string
  audio: AudioUpload
  onClose: () => void
  onSubmit: () => Promise<void>
  /** Shown above the drop zone. */
  intro?: ReactNode
  /** Extra fields below the file picker. */
  children?: ReactNode
}

/** The drop zone, file picker, progress and actions shared by every master upload. */
export function AudioUploadForm({
  title,
  submitLabel,
  audio,
  onClose,
  onSubmit,
  intro,
  children,
}: AudioUploadFormProps) {
  const drop = useFileDrop(audio.pending, audio.choose)
  return (
    <WorkspaceFormModal
      onClose={onClose}
      onSubmit={onSubmit}
      pending={audio.pending}
      pendingLabel="Uploading…"
      submitDisabled={!audio.file}
      submitLabel={submitLabel}
      title={title}
    >
      {intro}
      <div
        className={cn(
          'flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-text-secondary',
          drop.over && 'border-accent',
        )}
        {...drop.handlers}
      >
        {audio.file ? audio.file.name : 'Drop an audio file here'}
      </div>
      <MediaFilePicker
        accept={AUDIO_ACCEPT}
        disabled={audio.pending}
        file={audio.file}
        hint="WAV or FLAC masters are preferred; MP3 and OGG are accepted. Up to 512 MB. The file stays private to your workspace."
        label="Audio file"
        onChange={audio.choose}
        problem={audio.problem}
      />
      {children}
      <UploadProgress fraction={audio.progress} />
      {audio.error && (
        <p className="text-sm text-destructive" role="alert">
          {audio.error.message}
        </p>
      )}
      <p className="text-sm text-text-secondary">
        Uploading changes the track list, so you will confirm accuracy again
        before review.
      </p>
    </WorkspaceFormModal>
  )
}
