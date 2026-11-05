import { Button } from '@bitrate/ui-react'
import { trackVersionLabels } from '@entities/music'
import { type ReleaseSummary, releaseTypeLabels } from '@entities/release'
import { DeleteReleaseDialog, EditReleaseDialog } from '@features/edit-release'
import { useI18n } from '@shared/i18n'
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
  const { t, tp } = useI18n()
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
      title={
        mode === 'actions'
          ? t('music.item.actionsFor', { title: item.title })
          : item.title
      }
    >
      <div className="space-y-5">
        <CatalogueStatus item={item} />
        <p className="text-sm text-text-secondary">
          {item.artistName} ·{' '}
          {'version' in item
            ? `${t(trackVersionLabels[item.version])} · ${trackDuration(item.duration)}`
            : `${t(releaseTypeLabels[item.type])} · ${tp({ count: item.trackCount, key: 'common.tracks' })}`}
        </p>
        {item.isDemo && (
          <p className="text-sm text-text-secondary">{t('music.item.demo')}</p>
        )}
        {!('version' in item) && (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link
                onClick={close}
                params={{ releaseId: item.id }}
                to="/dashboard/music/$releaseId"
              >
                {t('music.item.openWorkspace')}
              </Link>
            </Button>
            {editableDraft && (
              <Button
                className="artist-workspace-primary"
                onClick={() => onChange({ ...details, mode: 'edit' })}
                variant="primary"
              >
                {t('music.item.editDraft')}
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
              {t('music.item.viewDetails')}
            </Button>
            {editableDraft && (
              <Button
                onClick={() => onChange({ ...details, mode: 'delete' })}
                variant="destructive"
              >
                {t('music.item.deleteDraft')}
              </Button>
            )}
          </div>
        )}
      </div>
    </WorkspaceModal>
  )
}
