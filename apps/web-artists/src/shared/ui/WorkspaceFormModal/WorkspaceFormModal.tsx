import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import type { FormEvent, ReactNode } from 'react'

interface WorkspaceFormModalProps {
  title: string
  onClose: () => void
  /** Runs after the native submit is prevented, so it may be RHF's `handleSubmit(...)`. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  /** A write is in flight: the modal cannot close and the actions are disabled. */
  pending: boolean
  /** The write's failure, shown above the actions. */
  error?: Error | null
  submitLabel: string
  /** Replaces the submit label while pending; defaults to “Saving…”. */
  pendingLabel?: string
  submitDisabled?: boolean
  /** Vertical rhythm of the form body; most workspace forms use `space-y-6`. */
  className?: string
  children: ReactNode
}

/** A workspace modal around one form with an error line and Cancel/Submit actions. */
export function WorkspaceFormModal({
  title,
  onClose,
  onSubmit,
  pending,
  error,
  submitLabel,
  pendingLabel,
  submitDisabled = false,
  className = 'space-y-6',
  children,
}: WorkspaceFormModalProps) {
  const { t, tMessage } = useI18n()
  return (
    <WorkspaceModal
      canClose={!pending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={title}
    >
      <form
        aria-busy={pending}
        className={className}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void onSubmit(event)
        }}
      >
        {children}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
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
            disabled={pending || submitDisabled}
            type="submit"
            variant="primary"
          >
            {pending ? (pendingLabel ?? t('common.saving')) : submitLabel}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
