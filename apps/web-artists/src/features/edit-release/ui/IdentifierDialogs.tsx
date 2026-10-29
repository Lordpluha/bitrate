import { Input } from '@bitrate/ui-react'
import {
  formatIsrc,
  normalizeIsrc,
  type ReleaseWorkspace,
  useSaveTrackIsrc,
  useUpdateRelease,
} from '@entities/release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceFormModal } from '@shared/ui/WorkspaceFormModal/WorkspaceFormModal'
import { useId, useState } from 'react'
import { isrcError, upcError } from '../model/rights.schema'

interface IdentifierDialogProps {
  title: string
  label: string
  hint: string
  initial: string
  validate: (value: string) => TranslationKey | null
  pending: boolean
  error: Error | null
  onReset: () => void
  onSave: (value: string | null) => Promise<void>
  onClose: () => void
}

/** Identifiers are optional: an empty field clears the saved code. */
function IdentifierDialog({
  title,
  label,
  hint,
  initial,
  validate,
  pending,
  error,
  onReset,
  onSave,
  onClose,
}: IdentifierDialogProps) {
  const id = useId()
  const { t } = useI18n()
  const [value, setValue] = useState(initial)
  const [invalid, setInvalid] = useState<TranslationKey | null>(null)
  const submit = async () => {
    const problem = validate(value)
    if (problem) {
      setInvalid(problem)
      return
    }
    const trimmed = value.trim()
    try {
      await onSave(trimmed === '' ? null : trimmed)
    } catch {
      // Keep the entered code when the write is rejected or unconfirmed.
    }
  }
  return (
    <WorkspaceFormModal
      error={error}
      onClose={onClose}
      onSubmit={submit}
      pending={pending}
      submitLabel={t('editRelease.saveCode')}
      title={title}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-code`}>
          {label}
        </label>
        <Input
          aria-describedby={invalid ? `${id}-error` : `${id}-hint`}
          aria-invalid={Boolean(invalid)}
          autoComplete="off"
          data-initial-focus
          disabled={pending}
          id={`${id}-code`}
          maxLength={15}
          onChange={(event) => {
            setInvalid(null)
            onReset()
            setValue(event.target.value)
          }}
          value={value}
        />
        <p className="text-sm text-text-secondary" id={`${id}-hint`}>
          {hint}
        </p>
        {invalid && (
          <p
            className="text-sm text-destructive"
            id={`${id}-error`}
            role="alert"
          >
            {t(invalid)}
          </p>
        )}
      </div>
    </WorkspaceFormModal>
  )
}

interface ReleaseDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

export function UpcDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: ReleaseDialogProps) {
  const mutation = useUpdateRelease(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const { t } = useI18n()
  return (
    <IdentifierDialog
      error={mutation.error}
      hint={t('editRelease.upcHint')}
      initial={release.upc ?? ''}
      label={t('editRelease.upcLabel')}
      onClose={onClose}
      onReset={() => mutation.reset()}
      onSave={async (upc) => {
        await mutation.mutateAsync({
          id: release.id,
          input: { upc, expectedUpdatedAt },
        })
        onSaved()
      }}
      pending={mutation.isPending}
      title={t('editRelease.upcTitle')}
      validate={upcError}
    />
  )
}

interface IsrcDialogProps extends ReleaseDialogProps {
  trackId: string
}

export function IsrcDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: IsrcDialogProps) {
  const mutation = useSaveTrackIsrc(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const track = release.trackDrafts.find((item) => item.id === trackId)
  const { t } = useI18n()
  return (
    <IdentifierDialog
      error={mutation.error}
      hint={t('editRelease.isrcHint')}
      initial={track?.isrc ? formatIsrc(track.isrc) : ''}
      label={t('editRelease.isrcLabel', {
        title: track?.title ?? t('editRelease.thisRecording'),
      })}
      onClose={onClose}
      onReset={() => mutation.reset()}
      onSave={async (isrc) => {
        await mutation.mutateAsync({
          id: release.id,
          trackId,
          input: {
            isrc: isrc === null ? null : (normalizeIsrc(isrc) ?? isrc),
            expectedUpdatedAt,
          },
        })
        onSaved()
      }}
      pending={mutation.isPending}
      title={t('editRelease.isrcTitle')}
      validate={isrcError}
    />
  )
}
