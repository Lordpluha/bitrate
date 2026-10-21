import { Button } from '@bitrate/ui-react'
import { CreateReleaseButton } from '@features/workspace-actions'

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
  return (
    <div className="space-y-4 px-6 py-14">
      <h2 className="text-lg">
        {filtered
          ? `No matching ${tab}`
          : tab === 'tracks'
            ? 'Your first track starts here'
            : 'Your first release starts here'}
      </h2>
      <p className="text-sm text-text-secondary">
        {filtered
          ? 'Try another search or reset your filters.'
          : tab === 'tracks'
            ? 'Your recordings and their preparation stages will appear here.'
            : 'Create a draft with a title and release type. Your music stays unpublished while you prepare it.'}
      </p>
      {filtered ? (
        <Button onClick={onReset} variant="outline">
          Reset filters
        </Button>
      ) : tab === 'releases' ? (
        <CreateReleaseButton />
      ) : (
        <Button onClick={onUploadTrack} variant="outline">
          Upload track
        </Button>
      )}
    </div>
  )
}
