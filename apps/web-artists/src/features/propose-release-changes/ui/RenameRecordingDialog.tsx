import { Input, toast } from '@bitrate/ui-react'
import { useSubmitReleaseChanges } from '@entities/release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceFormModal } from '@shared/ui/WorkspaceFormModal/WorkspaceFormModal'
import { useId, useState } from 'react'
import { buildProposal } from '../model/proposal'

export interface RenameRecordingDialogProps {
  artistId: string
  /** The release the recording first came out in; the request belongs to it. */
  releaseId: string
  recording: { id: string; title: string }
  onClose: () => void
}

/** Proposes a new title for one published recording; Bitrate reviews it before it applies. */
export function RenameRecordingDialog({
  artistId,
  releaseId,
  recording,
  onClose,
}: RenameRecordingDialogProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const submit = useSubmitReleaseChanges(artistId)
  const [title, setTitle] = useState(recording.title)
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  return (
    <WorkspaceFormModal
      error={submit.error}
      onClose={onClose}
      onSubmit={async () => {
        if (submit.isPending) return
        // The release title is passed through unchanged, so only the recording counts.
        const result = buildProposal(
          { title: '', recordings: [recording] },
          { title: '', recordings: { [recording.id]: title } },
        )
        if (!result.ok) {
          setProblem(result.error)
          return
        }
        setProblem(null)
        try {
          await submit.mutateAsync({
            id: releaseId,
            recordings: result.proposal.recordings,
          })
          toast.success(t('releaseChanges.sent'))
          onClose()
        } catch {
          // The modal shows why; the title stays for another try.
        }
      }}
      pending={submit.isPending}
      pendingLabel={t('releaseChanges.dialog.sending')}
      submitLabel={t('releaseChanges.dialog.submit')}
      title={t('releaseChanges.dialog.renameTitle', { title: recording.title })}
    >
      <p className="text-sm text-text-secondary">
        {t('releaseChanges.dialog.intro')}
      </p>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
          {t('releaseChanges.dialog.recordingTitle')}
        </label>
        <Input
          aria-describedby={`${id}-hint`}
          data-initial-focus
          disabled={submit.isPending}
          id={`${id}-title`}
          maxLength={255}
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <p className="text-xs text-text-secondary" id={`${id}-hint`}>
          {t('releaseChanges.dialog.recordingWarning')}
        </p>
      </div>
      {problem && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(problem)}
        </p>
      )}
    </WorkspaceFormModal>
  )
}
