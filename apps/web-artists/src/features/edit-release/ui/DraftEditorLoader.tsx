import { Button } from '@bitrate/ui-react'
import { type ReleaseSummary, useRelease } from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import type { ReactNode } from 'react'

interface DraftEditorLoaderProps {
  artistId: string
  releaseId: string
  title: string
  onClose: () => void
  renderDraft: (release: ReleaseSummary) => ReactNode
}

export function DraftEditorLoader({
  artistId,
  releaseId,
  title,
  onClose,
  renderDraft,
}: DraftEditorLoaderProps) {
  const query = useRelease(artistId, releaseId)
  if (query.data?.status === 'DRAFT' && !query.isPending && !query.isError)
    return renderDraft(query.data)
  return (
    <WorkspaceModal onClose={onClose} title={title}>
      {query.isPending ? (
        <p role="status">Loading the latest draft…</p>
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
