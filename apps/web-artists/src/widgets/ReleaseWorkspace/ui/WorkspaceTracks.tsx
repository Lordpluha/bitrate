import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import { formatIsrc, type ReleaseWorkspace } from '@entities/release'
import { Music2 } from 'lucide-react'

function duration(value: number | null) {
  return value === null
    ? 'Duration unavailable'
    : `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

interface WorkspaceTracksProps {
  release: ReleaseWorkspace
  onEditIsrc: (trackId: string) => void
}

const isrcLabel = (isrc: string | null) =>
  isrc ? `ISRC ${formatIsrc(isrc)}` : 'No ISRC yet'

export function WorkspaceTracks({ release, onEditIsrc }: WorkspaceTracksProps) {
  const draft = release.status === 'DRAFT'
  const shown = release.trackDrafts.length + release.tracks.length
  return (
    <section
      aria-labelledby="release-tracks-heading"
      className="artist-release-workspace-panel artist-release-tracks"
    >
      <h2 id="release-tracks-heading">
        Tracks <span>({release.trackCount})</span>
      </h2>
      <p>Recordings linked to this release.</p>
      {shown === 0 ? (
        <div className="artist-release-inset">
          <Music2 aria-hidden="true" className="size-5 shrink-0 text-accent" />
          <p>No tracks linked yet. Track uploads are coming soon.</p>
        </div>
      ) : (
        <ul>
          {release.trackDrafts.map((track) => (
            <li key={track.id}>
              <Music2
                aria-hidden="true"
                className="size-5 shrink-0 text-accent"
              />
              <div className="min-w-0 flex-1">
                <h3>{track.title}</h3>
                <p>
                  {trackVersionLabels[track.version]} ·{' '}
                  {duration(track.duration)}
                  {track.isDemo ? ' · Demo' : ''}
                </p>
                <p>{isrcLabel(track.isrc)}</p>
              </div>
              <span
                className="artist-release-track-status"
                data-status={track.status}
              >
                {trackStatusLabels[track.status]}
              </span>
              {draft && (
                <Button
                  aria-label={`Edit ISRC for ${track.title}`}
                  onClick={() => onEditIsrc(track.id)}
                  size="sm"
                  variant="outline"
                >
                  ISRC
                </Button>
              )}
            </li>
          ))}
          {release.tracks.map((track) => (
            <li key={track.id}>
              <Music2
                aria-hidden="true"
                className="size-5 shrink-0 text-accent"
              />
              <div>
                <h3>
                  {track.position}. {track.title}
                </h3>
                <p>Linked recording · {duration(track.duration)}</p>
                <p>{isrcLabel(track.isrc)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {release.trackCount > shown && (
        <p>
          Showing {shown} of {release.trackCount} tracks. This preview shows up
          to 50 draft recordings and 50 linked recordings.
        </p>
      )}
    </section>
  )
}
