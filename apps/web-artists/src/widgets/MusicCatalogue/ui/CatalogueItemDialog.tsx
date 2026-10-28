import { Button } from '@bitrate/ui-react'
import { trackVersionLabels } from '@entities/music'
import { type ReleaseSummary, releaseTypeLabels } from '@entities/release'
import { DeleteReleaseDialog, EditReleaseDialog } from '@features/edit-release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { Link } from '@tanstack/react-router'
import {
  type CatalogueItem,
  CatalogueStatus,
  trackDuration,
} from './CatalogueTable'

export interface CatalogueDetails {
  item: CatalogueItem
  mode: 'details' | 'actions' | 'edit' | 'delete'
}

interface CatalogueItemDialogProps {
  details: CatalogueDetails
  /** Signed-in artist; editing a draft needs it. */
  artistId: string | undefined
  onChange: (details: CatalogueDetails | null) => void
  onSaved: (release: ReleaseSummary) => void
}

/** Details or quick actions for one catalogue row, or the draft editor for a release. */
export function CatalogueItemDialog({
  details,
  artistId,
  onChange,
  onSaved,
}: CatalogueItemDialogProps) {
  const { item, mode } = details
  const close = () => onChange(null)
  const editableDraft =
    !('version' in item) && item.status === 'DRAFT' && !!artistId
  if (mode === 'delete' && editableDraft && artistId)
    return (
      <DeleteReleaseDialog
        artistId={artistId}
        onClose={() => onChange({ ...details, mode: 'actions' })}
        onDeleted={close}
        release={item}
      />
    )
  if (mode === 'edit' && artistId)
    return (
      <EditReleaseDialog
        artistId={artistId}
        onClose={close}
        onSaved={(release) => {
          close()
          onSaved(release)
        }}
        releaseId={item.id}
      />
    )
  return (
    <WorkspaceModal
      onClose={close}
      title={mode === 'actions' ? `Actions for ${item.title}` : item.title}
    >
      <div className="space-y-5">
        <CatalogueStatus item={item} />
        <p className="text-sm text-text-secondary">
          {item.artistName} ·{' '}
          {'version' in item
            ? `${trackVersionLabels[item.version]} · ${trackDuration(item.duration)}`
            : `${releaseTypeLabels[item.type]} · ${item.trackCount} tracks`}
        </p>
        {item.isDemo && (
          <p className="text-sm text-text-secondary">
            Illustrative demo record. This does not represent an actual
            publication or delivery.
          </p>
        )}
        {!('version' in item) && (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link
                onClick={close}
                params={{ releaseId: item.id }}
                to="/dashboard/music/$releaseId"
              >
                Open workspace
              </Link>
            </Button>
            {editableDraft && (
              <Button
                className="artist-workspace-primary"
                onClick={() => onChange({ ...details, mode: 'edit' })}
                variant="primary"
              >
                Edit draft
              </Button>
            )}
          </div>
        )}
        {mode === 'actions' && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onChange({ ...details, mode: 'details' })}
              variant="outline"
            >
              View details
            </Button>
            {editableDraft && (
              <Button
                onClick={() => onChange({ ...details, mode: 'delete' })}
                variant="destructive"
              >
                Delete draft
              </Button>
            )}
          </div>
        )}
      </div>
    </WorkspaceModal>
  )
}
