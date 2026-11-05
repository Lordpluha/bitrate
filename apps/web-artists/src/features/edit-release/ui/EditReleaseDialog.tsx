import { Button } from '@bitrate/ui-react'
import {
  type CreateReleaseValues,
  createReleaseSchema,
  ReleaseFields,
  type ReleaseSummary,
  useUpdateRelease,
} from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DraftEditorLoader } from './DraftEditorLoader'

interface EditReleaseDialogProps {
  artistId: string
  releaseId: string
  onClose: () => void
  onSaved: (release: ReleaseSummary) => void
}

export function EditReleaseDialog(props: EditReleaseDialogProps) {
  const { t } = useI18n()
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <EditReleaseForm {...props} release={release} />
      )}
      title={t('music.item.editDraft')}
    />
  )
}

function EditReleaseForm({
  artistId,
  release,
  onClose,
  onSaved,
}: EditReleaseDialogProps & { release: ReleaseSummary }) {
  const { t, tMessage } = useI18n()
  const update = useUpdateRelease(artistId)
  const form = useForm<CreateReleaseValues>({
    resolver: zodResolver(createReleaseSchema),
    defaultValues: { title: release.title, type: release.type },
    mode: 'onTouched',
  })
  // Keep the version associated with these form values throughout this edit session.
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const busy = update.isPending || form.formState.isSubmitting
  const submit = async (values: CreateReleaseValues) => {
    try {
      const saved = await update.mutateAsync({
        id: release.id,
        input: { ...values, expectedUpdatedAt },
      })
      onSaved(saved)
    } catch {
      // Preserve entries after rejection or an unconfirmed network response.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      onClose={onClose}
      title={t('music.item.editDraft')}
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('editRelease.editIntro')}
        </p>
        <ReleaseFields
          busy={busy}
          form={form}
          onChange={() => update.reset()}
        />
        {update.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(update.error.message)}
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
            disabled={busy || !form.formState.isDirty}
            type="submit"
            variant="primary"
          >
            {busy
              ? t('editRelease.savingChanges')
              : t('editRelease.saveChanges')}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
