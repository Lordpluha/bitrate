import { Button } from '@bitrate/ui-react'
import { useContributor } from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { ContributorForm } from './ContributorForm'

interface EditContributorDialogProps {
  artistId: string
  releaseId: string
  contributorId: string
  onClose: () => void
  onSaved: () => void
}

export function EditContributorDialog({
  artistId,
  releaseId,
  contributorId,
  onClose,
  onSaved,
}: EditContributorDialogProps) {
  const query = useContributor(artistId, releaseId, contributorId)
  if (
    query.data &&
    !query.isFetching &&
    !query.isError &&
    query.data.release.status === 'DRAFT'
  )
    return (
      <ContributorForm
        artistId={artistId}
        onClose={onClose}
        onSaved={onSaved}
        participant={query.data.participant}
        release={query.data.release}
      />
    )
  return (
    <WorkspaceModal onClose={onClose} title="Edit contributor">
      {query.isPending || query.isFetching ? (
        <p role="status">Loading the latest contributor…</p>
      ) : query.isError ? (
        <div className="space-y-4">
          <p role="alert">{query.error.message}</p>
          <Button
            onClick={() => {
              void query.refetch()
            }}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : (
        <p role="alert">
          This release is no longer a draft. Close the form and refresh Music to
          review its status.
        </p>
      )}
    </WorkspaceModal>
  )
}
