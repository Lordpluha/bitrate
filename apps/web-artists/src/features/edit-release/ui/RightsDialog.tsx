import { Button, Input } from '@bitrate/ui-react'
import { type ReleaseWorkspace, useSaveRights } from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type RightsFormValues, rightsFormSchema } from '../model/rights.schema'

interface RightsDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

export function RightsDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: RightsDialogProps) {
  const id = useId()
  const mutation = useSaveRights(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const { rights } = release
  const form = useForm<RightsFormValues>({
    resolver: zodResolver(rightsFormSchema),
    defaultValues: {
      ownerType: rights.masterOwnerType ?? undefined,
      ownerName: rights.masterOwnerName ?? '',
      writersConfirmed: rights.writersConfirmedAt !== null,
      accuracyConfirmed: rights.accuracyConfirmedAt !== null,
    },
    mode: 'onTouched',
  })
  const { errors, isSubmitting } = form.formState
  const ownerType = form.watch('ownerType')
  const busy = mutation.isPending || isSubmitting
  const reset = () => mutation.reset()
  const submit = async (values: RightsFormValues) => {
    try {
      await mutation.mutateAsync({
        id: release.id,
        input: {
          masterOwner:
            values.ownerType === 'OTHER'
              ? { type: 'OTHER', name: values.ownerName.trim() }
              : { type: 'ARTIST' },
          writersConfirmed: values.writersConfirmed,
          accuracyConfirmed: values.accuracyConfirmed,
          expectedUpdatedAt,
        },
      })
      onSaved()
    } catch {
      // Keep the answers when the write is rejected or unconfirmed.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Rights confirmation"
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm text-text-secondary">
          Confirm what is true for this draft before review.
        </p>
        <fieldset
          aria-describedby={errors.ownerType ? `${id}-owner-error` : undefined}
          className="space-y-3"
          disabled={busy}
        >
          <legend className="text-sm font-medium">
            Who controls the master recording?
          </legend>
          <label className="artist-release-credit-role">
            <input
              data-initial-focus
              type="radio"
              value="ARTIST"
              {...form.register('ownerType', { onChange: reset })}
            />
            <span>{release.artistName} (this artist)</span>
          </label>
          <label className="artist-release-credit-role">
            <input
              type="radio"
              value="OTHER"
              {...form.register('ownerType', { onChange: reset })}
            />
            <span>Another owner, such as a label</span>
          </label>
          {errors.ownerType && (
            <p
              className="text-sm text-destructive"
              id={`${id}-owner-error`}
              role="alert"
            >
              {errors.ownerType.message}
            </p>
          )}
        </fieldset>
        {ownerType === 'OTHER' && (
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-owner-name`}
            >
              Master owner name
            </label>
            <Input
              aria-describedby={
                errors.ownerName ? `${id}-owner-name-error` : undefined
              }
              aria-invalid={Boolean(errors.ownerName)}
              aria-required="true"
              autoComplete="organization"
              disabled={busy}
              id={`${id}-owner-name`}
              maxLength={255}
              {...form.register('ownerName', { onChange: reset })}
            />
            {errors.ownerName && (
              <p
                className="text-sm text-destructive"
                id={`${id}-owner-name-error`}
                role="alert"
              >
                {errors.ownerName.message}
              </p>
            )}
          </div>
        )}
        <fieldset className="space-y-3" disabled={busy}>
          <legend className="text-sm font-medium">Confirmations</legend>
          <label className="artist-release-credit-role">
            <input
              type="checkbox"
              {...form.register('writersConfirmed', { onChange: reset })}
            />
            <span>All songwriters and composers are listed</span>
          </label>
          <label className="artist-release-credit-role">
            <input
              type="checkbox"
              {...form.register('accuracyConfirmed', { onChange: reset })}
            />
            <span>I confirm this information is accurate</span>
          </label>
        </fieldset>
        <p className="text-sm text-text-secondary">
          Changing contributors later clears both confirmations; changing splits
          clears the accuracy confirmation.
        </p>
        {mutation.error && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={busy}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={busy}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving rights…' : 'Save rights'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
