import { Button, Input } from '@bitrate/ui-react'
import {
  type ContributorValues,
  contributorRoles,
  contributorSchema,
  participantRoleLabels,
  type ReleaseContributor,
  type ReleaseSummary,
  useSaveContributor,
} from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'

interface ContributorFormProps {
  artistId: string
  release: ReleaseSummary
  participant?: ReleaseContributor['participant']
  onClose: () => void
  onSaved: () => void
}

export function ContributorForm({
  artistId,
  release,
  participant,
  onClose,
  onSaved,
}: ContributorFormProps) {
  const id = useId()
  const mutation = useSaveContributor(artistId, participant?.id)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const form = useForm<ContributorValues>({
    resolver: zodResolver(contributorSchema),
    defaultValues: participant
      ? { displayName: participant.displayName, roles: participant.roles }
      : { displayName: '', roles: [] },
    mode: 'onTouched',
  })
  const { errors, isSubmitting, isDirty } = form.formState
  const title = participant ? 'Edit contributor' : 'Add contributor'
  const parsed = contributorSchema.safeParse(form.watch())
  const changed =
    !participant ||
    (parsed.success
      ? parsed.data.displayName !== participant.displayName ||
        parsed.data.roles.length !== participant.roles.length ||
        !parsed.data.roles.every((role) => participant.roles.includes(role))
      : isDirty)
  const busy = mutation.isPending || isSubmitting
  const submit = async (values: ContributorValues) => {
    try {
      await mutation.mutateAsync({
        id: release.id,
        input: { ...values, expectedUpdatedAt },
      })
      onSaved()
    } catch {
      // Preserve the entries when the write is rejected or unconfirmed.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={title}
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm text-text-secondary">
          Credit a person involved in this release and assign at least one role.
        </p>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-name`}>
            Contributor name
          </label>
          <Input
            aria-describedby={
              errors.displayName ? `${id}-name-error` : undefined
            }
            aria-invalid={Boolean(errors.displayName)}
            aria-required="true"
            autoComplete="off"
            data-initial-focus
            disabled={busy}
            id={`${id}-name`}
            maxLength={255}
            {...form.register('displayName', {
              onChange: () => mutation.reset(),
            })}
          />
          {errors.displayName && (
            <p
              className="text-sm text-destructive"
              id={`${id}-name-error`}
              role="alert"
            >
              {errors.displayName.message}
            </p>
          )}
        </div>
        <fieldset
          aria-describedby={
            errors.roles ? `${id}-roles-error` : `${id}-roles-hint`
          }
          className="space-y-3"
          disabled={busy}
        >
          <legend className="text-sm font-medium">Assigned roles</legend>
          <p className="text-sm text-text-secondary" id={`${id}-roles-hint`}>
            Choose at least one role.
          </p>
          <div className="artist-release-credit-roles">
            {contributorRoles.map((role) => (
              <label className="artist-release-credit-role" key={role}>
                <input
                  type="checkbox"
                  value={role}
                  {...form.register('roles', {
                    onChange: () => mutation.reset(),
                  })}
                />
                <span>{participantRoleLabels[role]}</span>
              </label>
            ))}
          </div>
          {errors.roles && (
            <p
              className="text-sm text-destructive"
              id={`${id}-roles-error`}
              role="alert"
            >
              {errors.roles.message}
            </p>
          )}
        </fieldset>
        <p className="text-sm text-text-secondary">
          Credits do not grant workspace access. Rights and revenue splits are
          coming soon.
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
            disabled={busy || !changed}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving contributor…' : 'Save contributor'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
