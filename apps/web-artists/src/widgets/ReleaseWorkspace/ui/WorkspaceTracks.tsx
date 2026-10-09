import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import {
  formatBytes,
  formatIsrc,
  type ReleaseWorkspace,
  releaseAudioUrl,
} from '@entities/release'
import { CircleAlert, Music2, Upload } from 'lucide-react'

function duration(value: number | null) {
  return value === null
    ? 'Duration unavailable'
    : `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

/** Everything an artist can do with the recordings of a draft. */
export interface TrackActions {
  onAdd: () => void
  onEditIsrc: (trackId: string) => void
  onReplaceAudio: (trackId: string) => void
  onRename: (trackId: string) => void
  onRemove: (trackId: string) => void
}

interface WorkspaceTracksProps {
  release: ReleaseWorkspace
  actions: TrackActions
}

const isrcLabel = (isrc: string | null) =>
  isrc ? `ISRC ${formatIsrc(isrc)}` : 'No ISRC yet'

type TrackDraft = ReleaseWorkspace['trackDrafts'][number]

function audioLabel(track: TrackDraft) {
  if (!track.hasAudio) return 'No audio uploaded'
  const size =
    track.audioSizeBytes === null
      ? ''
      : ` · ${formatBytes(track.audioSizeBytes)}`
  return `${track.audioFileName ?? 'Audio uploaded'}${size}`
}

export function WorkspaceTracks({ release, actions }: WorkspaceTracksProps) {
  const draft = release.status === 'DRAFT'
  const shown = release.trackDrafts.length + release.tracks.length
  return (
    <section
      aria-labelledby="release-tracks-heading"
      className="artist-release-workspace-panel artist-release-tracks"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-tracks-heading">
          Tracks <span>({release.trackCount})</span>
        </h2>
        {draft && (
          <Button onClick={actions.onAdd} size="sm" variant="outline">
            <Upload aria-hidden="true" className="size-4" />
            Upload track
          </Button>
        )}
      </div>
      <p>Recordings in this release. Uploaded audio stays private.</p>
      {shown === 0 ? (
        <div className="artist-release-inset">
          <Music2 aria-hidden="true" className="size-5 shrink-0 text-accent" />
          <p>
            {draft
              ? 'No tracks yet. Upload a WAV or FLAC master to add the first one.'
              : 'No tracks linked to this release.'}
          </p>
        </div>
      ) : (
        <ul>
          {release.trackDrafts.map((track) => (
            <li key={track.id}>
              <Music2
                aria-hidden="true"
                className="size-5 shrink-0 text-accent"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h3>{track.title}</h3>
                <p>
                  {trackVersionLabels[track.version]} ·{' '}
                  {duration(track.duration)}
                  {track.isDemo ? ' · Demo' : ''}
                </p>
                <p>{isrcLabel(track.isrc)}</p>
                <p className="flex items-center gap-1">
                  {!track.hasAudio && (
                    <CircleAlert
                      aria-hidden="true"
                      className="size-4 shrink-0 text-destructive"
                    />
                  )}
                  <span className="truncate">{audioLabel(track)}</span>
                </p>
                {track.hasAudio && (
                  <audio
                    aria-label={`Play ${track.title}`}
                    className="mt-2 w-full max-w-md"
                    controls
                    crossOrigin="use-credentials"
                    preload="none"
                    src={releaseAudioUrl(release.id, track.id)}
                  >
                    <track kind="captions" />
                  </audio>
                )}
              </div>
              <span
                className="artist-release-track-status"
                data-status={track.status}
              >
                {trackStatusLabels[track.status]}
              </span>
              {draft && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    aria-label={`${track.hasAudio ? 'Replace audio' : 'Upload audio'} for ${track.title}`}
                    onClick={() => actions.onReplaceAudio(track.id)}
                    size="sm"
                    variant="outline"
                  >
                    {track.hasAudio ? 'Replace audio' : 'Upload audio'}
                  </Button>
                  <Button
                    aria-label={`Rename ${track.title}`}
                    onClick={() => actions.onRename(track.id)}
                    size="sm"
                    variant="outline"
                  >
                    Rename
                  </Button>
                  <Button
                    aria-label={`Edit ISRC for ${track.title}`}
                    onClick={() => actions.onEditIsrc(track.id)}
                    size="sm"
                    variant="outline"
                  >
                    ISRC
                  </Button>
                  <Button
                    aria-label={`Remove ${track.title}`}
                    onClick={() => actions.onRemove(track.id)}
                    size="sm"
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </div>
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
