import { Button, Input } from '@bitrate/ui-react'
import { type ReleaseWorkspace, useSaveRights } from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@shared/i18n'
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
  const { t, tMessage } = useI18n()
  const id = useId()
  const mutation = useSaveRights(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const { rights } = release
  const form = useForm<RightsFormValues>({
    resolver: zodResolver(rightsFormSchema),
    defaultValues: {
      // Most artists own their recording, so that answer starts selected.
      ownerType: rights.masterOwnerType ?? 'ARTIST',
      ownerName: rights.masterOwnerName ?? '',
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
      title={t('editRelease.rightsTitle')}
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm text-text-secondary">
          {t('editRelease.rightsIntro')}
        </p>
        <fieldset
          aria-describedby={errors.ownerType ? `${id}-owner-error` : undefined}
          className="space-y-3"
          disabled={busy}
        >
          <legend className="text-sm font-medium">
            {t('editRelease.masterQuestion')}
          </legend>
          <label className="artist-release-credit-role">
            <input
              data-initial-focus
              type="radio"
              value="ARTIST"
              {...form.register('ownerType', { onChange: reset })}
            />
            <span>
              {t('workspace.rights.thisArtist', { name: release.artistName })}
            </span>
          </label>
          <label className="artist-release-credit-role">
            <input
              type="radio"
              value="OTHER"
              {...form.register('ownerType', { onChange: reset })}
            />
            <span>{t('editRelease.otherOwner')}</span>
          </label>
          {errors.ownerType && (
            <p
              className="text-sm text-destructive"
              id={`${id}-owner-error`}
              role="alert"
            >
              {tMessage(errors.ownerType.message)}
            </p>
          )}
        </fieldset>
        {ownerType === 'OTHER' && (
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-owner-name`}
            >
              {t('editRelease.ownerName')}
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
                {tMessage(errors.ownerName.message)}
              </p>
            )}
          </div>
        )}
        <p className="text-sm text-text-secondary">
          {t('editRelease.rightsNote')}
        </p>
        {mutation.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(mutation.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={busy}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={busy}
            type="submit"
            variant="primary"
          >
            {busy ? t('editRelease.savingRights') : t('editRelease.saveRights')}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
