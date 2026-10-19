import { Button, Input } from '@bitrate/ui-react'
import { useDeleteAccount } from '@entities/artist-account'
import { ROUTES } from '@shared/routes/routes'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'

interface DeleteAccountSectionProps {
  artistId: string
  username: string
}

/** Consequence-aware deletion: the handle must be typed before the request is possible. */
export function DeleteAccountSection({
  artistId,
  username,
}: DeleteAccountSectionProps) {
  const id = useId()
  const remove = useDeleteAccount(artistId)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const matches = typed.trim() === username

  const confirm = async () => {
    try {
      await remove.mutateAsync()
      window.location.assign(ROUTES.auth.login)
    } catch {
      // The account stays; the error explains what to do next.
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium">Delete account</p>
        <p className="text-sm text-text-secondary">
          Removes your artist account from Bitrate and signs you out.
        </p>
      </div>
      <Button onClick={() => setOpen(true)} size="sm" variant="destructive">
        Delete account
      </Button>
      {open && (
        <WorkspaceModal
          canClose={!remove.isPending}
          className="artist-release-credit-modal"
          onClose={() => {
            setOpen(false)
            setTyped('')
            remove.reset()
          }}
          title="Delete account"
        >
          <form
            aria-busy={remove.isPending}
            className="space-y-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (matches) void confirm()
            }}
          >
            <p className="text-sm">
              This cannot be undone from the workspace. Type{' '}
              <strong>{username}</strong> to confirm.
            </p>
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor={`${id}-handle`}
              >
                Your handle
              </label>
              <Input
                autoComplete="off"
                data-initial-focus
                disabled={remove.isPending}
                id={`${id}-handle`}
                onChange={(event) => setTyped(event.target.value)}
                value={typed}
              />
            </div>
            {remove.error && (
              <p className="text-sm text-destructive" role="alert">
                {remove.error.message}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                disabled={remove.isPending}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Keep account
              </Button>
              <Button
                disabled={remove.isPending || !matches}
                type="submit"
                variant="destructive"
              >
                {remove.isPending ? 'Deleting…' : 'Delete account'}
              </Button>
            </div>
          </form>
        </WorkspaceModal>
      )}
    </div>
  )
}
