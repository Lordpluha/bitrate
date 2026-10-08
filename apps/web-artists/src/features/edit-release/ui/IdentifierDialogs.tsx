import { Button, Input } from '@bitrate/ui-react'
import {
  formatIsrc,
  normalizeIsrc,
  type ReleaseWorkspace,
  useSaveTrackIsrc,
  useUpdateRelease,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { isrcError, upcError } from '../model/rights.schema'

interface IdentifierDialogProps {
  title: string
  label: string
  hint: string
  initial: string
  validate: (value: string) => string | null
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
  const [value, setValue] = useState(initial)
  const [invalid, setInvalid] = useState<string | null>(null)
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
    <WorkspaceModal
      canClose={!pending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={title}
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
              {invalid}
            </p>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
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
            disabled={pending}
            type="submit"
            variant="primary"
          >
            {pending ? 'Saving…' : 'Save code'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
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
  return (
    <IdentifierDialog
      error={mutation.error}
      hint="Optional. 12-digit UPC or 13-digit EAN. Leave empty if your distributor will assign one."
      initial={release.upc ?? ''}
      label="Release UPC/EAN"
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
      title="Release barcode"
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
  return (
    <IdentifierDialog
      error={mutation.error}
      hint="Optional. Format CC-XXX-YY-NNNNN. Leave empty if your distributor will assign one."
      initial={track?.isrc ? formatIsrc(track.isrc) : ''}
      label={`ISRC for ${track?.title ?? 'this recording'}`}
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
      title="Recording ISRC"
      validate={isrcError}
    />
  )
}
