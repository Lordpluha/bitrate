import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { formatDateTimeUtc } from '@shared/lib/date'
import { Music2 } from 'lucide-react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceOverviewProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

/** Artwork, identity and the one next action for this release. */
export function WorkspaceOverview({
  release,
  onAction,
}: WorkspaceOverviewProps) {
  const draft = release.status === 'DRAFT'
  return (
    <section
      aria-label="Release summary"
      className="artist-release-workspace-panel artist-release-overview"
    >
      <img
        alt=""
        aria-hidden="true"
        className="artist-release-waveform"
        src="/artwork/releases/release-waveform.png"
      />
      <div className="artist-release-identity">
        {release.cover ? (
          <img
            alt={`${release.title} artwork`}
            className="artist-release-cover"
            src={releaseCoverUrl(release.cover)}
          />
        ) : (
          <div className="artist-release-cover artist-release-cover-placeholder">
            <Music2 aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h2>{release.title}</h2>
          <p>
            {release.artistName} · {releaseTypeLabels[release.type]} ·{' '}
            {release.trackCount} {release.trackCount === 1 ? 'track' : 'tracks'}
          </p>
          <span className="artist-release-status">
            {releaseStatusLabels[release.status]}
          </span>
          <p className="artist-release-updated">
            Updated {formatDateTimeUtc(release.updatedAt)} UTC
          </p>
        </div>
      </div>
      <div className="artist-release-next-action">
        <div>
          <p className="artist-release-eyebrow">Next action</p>
          <h3>
            {draft
              ? 'Continue preparing your release'
              : 'Check your release details'}
          </h3>
          <p className="artist-release-next-description">
            {draft
              ? 'Upload artwork and audio, confirm rights and submit for review.'
              : 'This release is available to view.'}
          </p>
        </div>
        {draft ? (
          <Button
            className="artist-workspace-primary rounded-full"
            onClick={() => onAction({ kind: 'edit' })}
            variant="primary"
          >
            Edit draft
          </Button>
        ) : (
          <Button
            asChild
            className="artist-workspace-primary rounded-full"
            variant="primary"
          >
            <a href="#release-tracks-heading">View tracks</a>
          </Button>
        )}
      </div>
    </section>
  )
}
