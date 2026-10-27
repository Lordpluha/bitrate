import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useCreditSelf,
  useRemoveContributor,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useState } from 'react'

interface CreditDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

interface RemoveContributorDialogProps extends CreditDialogProps {
  contributorId: string
}

export function RemoveContributorDialog({
  artistId,
  release,
  contributorId,
  onClose,
  onSaved,
}: RemoveContributorDialogProps) {
  const remove = useRemoveContributor(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const person = release.participants.find((item) => item.id === contributorId)

  const confirm = async () => {
    try {
      await remove.mutateAsync({
        id: release.id,
        contributorId,
        expectedUpdatedAt,
      })
      onSaved()
    } catch {
      // The credit stays; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Remove contributor"
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          Remove <strong>{person?.displayName ?? 'this contributor'}</strong>{' '}
          from the release? Their master and publishing shares are removed, so
          the splits must add up to 100% again.
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
            Keep contributor
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending ? 'Removing…' : 'Remove contributor'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}

export function CreditSelfDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: CreditDialogProps) {
  const credit = useCreditSelf(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)

  const confirm = async () => {
    try {
      await credit.mutateAsync({ id: release.id, expectedUpdatedAt })
      onSaved()
    } catch {
      // Nothing was credited; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!credit.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="I made it myself"
    >
      <div aria-busy={credit.isPending} className="space-y-6">
        <p>
          Credit <strong>{release.artistName}</strong> as performer, composer
          and lyricist with 100% of the master and publishing splits. You can
          add collaborators and divide the shares later.
        </p>
        {credit.error && (
          <p className="text-sm text-destructive" role="alert">
            {credit.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={credit.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            data-initial-focus
            disabled={credit.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="primary"
          >
            {credit.isPending ? 'Crediting…' : 'Credit me alone'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
