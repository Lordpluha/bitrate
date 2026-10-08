import { Button } from '@bitrate/ui-react'
import {
  type CreateReleaseValues,
  createReleaseSchema,
  ReleaseFields,
  type ReleaseSummary,
  useCreateRelease,
} from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@shared/routes/routes'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

interface CreateReleaseDialogProps {
  artistId: string
  onClose: () => void
}

export function CreateReleaseDialog({
  artistId,
  onClose,
}: CreateReleaseDialogProps) {
  const create = useCreateRelease(artistId)
  const navigate = useNavigate()
  const form = useForm<CreateReleaseValues>({
    resolver: zodResolver(createReleaseSchema),
    defaultValues: { title: '', type: 'SINGLE' },
    mode: 'onTouched',
  })
  const busy = create.isPending || form.formState.isSubmitting

  const submit = async (values: CreateReleaseValues) => {
    let draft: ReleaseSummary
    try {
      draft = await create.mutateAsync(values)
    } catch {
      return
    }
    try {
      await navigate({
        to: ROUTES.dashboard.music,
        search: { page: 1, created: draft.id },
      })
      onClose()
    } catch {
      // The saved state remains visible with a link; never retry a successful POST.
    }
  }

  return (
    <WorkspaceModal canClose={!busy} onClose={onClose} title="Create release">
      {create.isSuccess ? (
        <div className="space-y-6">
          <p role="status">Draft created: {create.data.title}</p>
          <Button
            asChild
            className="artist-workspace-primary"
            variant="primary"
          >
            <Link
              onClick={onClose}
              search={{ page: 1, created: create.data.id }}
              to={ROUTES.dashboard.music}
            >
              View in Music
            </Link>
          </Button>
        </div>
      ) : (
        <form
          aria-busy={busy}
          className="space-y-6"
          noValidate
          onSubmit={form.handleSubmit(submit)}
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            Start with a title and release type. This saves a draft; it does not
            publish your music. Tracks and artwork editing are coming soon.
          </p>
          <ReleaseFields
            busy={busy}
            form={form}
            onChange={() => create.reset()}
          />
          {create.error && (
            <div className="space-y-2">
              <p className="text-sm text-destructive" role="alert">
                {create.error.message}
              </p>
              <Link
                className="text-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onClose}
                search={{ page: 1 }}
                to={ROUTES.dashboard.music}
              >
                Check Music
              </Link>
            </div>
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
              {busy ? 'Creating draft…' : 'Create draft'}
            </Button>
          </div>
        </form>
      )}
    </WorkspaceModal>
  )
}
