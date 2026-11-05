import { cn } from '@bitrate/ui-react'
import { AUDIO_ACCEPT } from '@entities/release'
import { useI18n } from '@shared/i18n'
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
  const { t, tMessage } = useI18n()
  const drop = useFileDrop(audio.pending, audio.choose)
  return (
    <WorkspaceFormModal
      onClose={onClose}
      onSubmit={onSubmit}
      pending={audio.pending}
      pendingLabel={t('media.uploading')}
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
        {audio.file ? audio.file.name : t('media.dropAudio')}
      </div>
      <MediaFilePicker
        accept={AUDIO_ACCEPT}
        disabled={audio.pending}
        file={audio.file}
        hint={t('media.audioHint')}
        label={t('media.audioFile')}
        onChange={audio.choose}
        problem={audio.problem}
      />
      {children}
      <UploadProgress fraction={audio.progress} />
      {audio.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(audio.error.message)}
        </p>
      )}
      <p className="text-sm text-text-secondary">{t('media.confirmNote')}</p>
    </WorkspaceFormModal>
  )
}
