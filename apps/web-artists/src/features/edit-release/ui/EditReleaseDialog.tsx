import { Button } from '@bitrate/ui-react'
import {
  type CreateReleaseValues,
  createReleaseSchema,
  ReleaseFields,
  type ReleaseSummary,
  useUpdateRelease,
} from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
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
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <EditReleaseForm {...props} release={release} />
      )}
      title="Edit draft"
    />
  )
}

function EditReleaseForm({
  artistId,
  release,
  onClose,
  onSaved,
}: EditReleaseDialogProps & { release: ReleaseSummary }) {
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
    <WorkspaceModal canClose={!busy} onClose={onClose} title="Edit draft">
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          Update the draft title and release type. Your music stays unpublished.
          Artwork and track editing are coming soon.
        </p>
        <ReleaseFields
          busy={busy}
          form={form}
          onChange={() => update.reset()}
        />
        {update.error && (
          <p className="text-sm text-destructive" role="alert">
            {update.error.message}
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
            disabled={busy || !form.formState.isDirty}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving changes…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
