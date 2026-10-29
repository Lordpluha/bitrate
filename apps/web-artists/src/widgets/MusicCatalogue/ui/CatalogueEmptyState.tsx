import { Button } from '@bitrate/ui-react'
import { CreateReleaseButton } from '@features/workspace-actions'
import { useI18n } from '@shared/i18n'

interface CatalogueEmptyStateProps {
  tab: 'tracks' | 'releases'
  /** A search or filter is applied, so the catalogue itself may not be empty. */
  filtered: boolean
  onReset: () => void
  onUploadTrack: () => void
}

export function CatalogueEmptyState({
  tab,
  filtered,
  onReset,
  onUploadTrack,
}: CatalogueEmptyStateProps) {
  const { t } = useI18n()
  return (
    <div className="space-y-4 px-6 py-14">
      <h2 className="text-lg">
        {filtered
          ? t(
              tab === 'tracks'
                ? 'music.empty.noTracks'
                : 'music.empty.noReleases',
            )
          : tab === 'tracks'
            ? t('music.empty.firstTrack')
            : t('music.empty.firstRelease')}
      </h2>
      <p className="text-sm text-text-secondary">
        {filtered
          ? t('music.empty.filteredHint')
          : tab === 'tracks'
            ? t('music.empty.tracksHint')
            : t('music.empty.releasesHint')}
      </p>
      {filtered ? (
        <Button onClick={onReset} variant="outline">
          {t('music.empty.resetFilters')}
        </Button>
      ) : tab === 'releases' ? (
        <CreateReleaseButton />
      ) : (
        <Button onClick={onUploadTrack} variant="outline">
          {t('music.uploadTrack')}
        </Button>
      )}
    </div>
  )
}
