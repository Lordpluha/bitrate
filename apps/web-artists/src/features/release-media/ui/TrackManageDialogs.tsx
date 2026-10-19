import { Button, Input } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useRemoveTrack,
  useRenameTrack,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'

const MAX_TITLE_LENGTH = 255

interface TrackDialogProps {
  artistId: string
  release: ReleaseWorkspace
  trackId: string
  onClose: () => void
  onSaved: () => void
}

export function RenameTrackDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackDialogProps) {
  const id = useId()
  const rename = useRenameTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const track = release.trackDrafts.find((item) => item.id === trackId)
  const [title, setTitle] = useState(track?.title ?? '')
  const [problem, setProblem] = useState<string | null>(null)
  const unchanged = title.trim() === track?.title

  const submit = async () => {
    const trimmed = title.trim()
    if (trimmed === '') {
      setProblem('Enter a title for this recording.')
      return
    }
    try {
      await rename.mutateAsync({
        id: release.id,
        trackId,
        title: trimmed,
        expectedUpdatedAt,
      })
      onSaved()
    } catch {
      // Keep the entered title when the write is rejected or unconfirmed.
    }
  }

  return (
    <WorkspaceModal
      canClose={!rename.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Rename track"
    >
      <form
        aria-busy={rename.isPending}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
            Track title
          </label>
          <Input
            aria-describedby={problem ? `${id}-error` : undefined}
            aria-invalid={Boolean(problem)}
            autoComplete="off"
            data-initial-focus
            disabled={rename.isPending}
            id={`${id}-title`}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => {
              setProblem(null)
              rename.reset()
              setTitle(event.target.value)
            }}
            value={title}
          />
          {problem && (
            <p
              className="text-sm text-destructive"
              id={`${id}-error`}
              role="alert"
            >
              {problem}
            </p>
          )}
        </div>
        {rename.error && (
          <p className="text-sm text-destructive" role="alert">
            {rename.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={rename.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={rename.isPending || unchanged}
            type="submit"
            variant="primary"
          >
            {rename.isPending ? 'Saving…' : 'Save title'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}

export function RemoveTrackDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackDialogProps) {
  const remove = useRemoveTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const track = release.trackDrafts.find((item) => item.id === trackId)

  const confirm = async () => {
    try {
      await remove.mutateAsync({ id: release.id, trackId, expectedUpdatedAt })
      onSaved()
    } catch {
      // The recording stays; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Remove track"
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          Remove <strong>{track?.title ?? 'this recording'}</strong> from the
          release? Its uploaded audio is deleted and its ISRC is freed. This
          cannot be undone.
        </p>
        {remove.error && (
          <p className="text-sm text-destructive" role="alert">
            {remove.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            data-initial-focus
            disabled={remove.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Keep track
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending ? 'Removing…' : 'Remove track'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
