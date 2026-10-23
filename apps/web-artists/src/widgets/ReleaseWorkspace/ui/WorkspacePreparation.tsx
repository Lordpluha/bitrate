import { Button } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { formatDateTimeUtc } from '@shared/lib/date'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspacePreparationProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

export function WorkspacePreparation({
  release,
  onAction,
}: WorkspacePreparationProps) {
  return (
    <section
      aria-labelledby="release-preparation-heading"
      className="artist-release-workspace-panel artist-release-preparation"
    >
      <h2 id="release-preparation-heading">Preparation summary</h2>
      {release.status === 'DRAFT' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() => onAction({ kind: 'cover' })}
            size="sm"
            variant="outline"
          >
            {release.cover ? 'Change artwork' : 'Upload artwork'}
          </Button>
          <Button
            onClick={() => onAction({ kind: 'schedule' })}
            size="sm"
            variant="outline"
          >
            Edit schedule
          </Button>
        </div>
      )}
      <dl>
        <div>
          <dt>Tracks linked</dt>
          <dd>{release.trackCount}</dd>
        </div>
        <div>
          <dt>Artwork</dt>
          <dd>{release.cover ? 'Added' : 'Not added'}</dd>
        </div>
        <div>
          <dt>Scheduled date</dt>
          <dd>
            {release.scheduledAt
              ? `${formatDateTimeUtc(release.scheduledAt)} UTC`
              : 'Not scheduled'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
