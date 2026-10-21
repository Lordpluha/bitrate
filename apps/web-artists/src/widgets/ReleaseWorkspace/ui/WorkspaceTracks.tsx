import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import {
  formatBytes,
  formatIsrc,
  type ReleaseWorkspace,
  releaseAudioUrl,
  useReorderTracks,
} from '@entities/release'
import { formatDuration } from '@shared/lib/format'
import { ArrowDown, ArrowUp, CircleAlert, Music2, Upload } from 'lucide-react'

function duration(value: number | null) {
  return value === null ? 'Duration unavailable' : formatDuration(value)
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
  artistId: string
  release: ReleaseWorkspace
  actions: TrackActions
}

/** Swaps a recording with its neighbour; the API receives the whole new order. */
function movedOrder(ids: string[], index: number, step: -1 | 1) {
  const next = [...ids]
  const target = index + step
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
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

export function WorkspaceTracks({
  artistId,
  release,
  actions,
}: WorkspaceTracksProps) {
  const draft = release.status === 'DRAFT'
  const shown = release.trackDrafts.length + release.tracks.length
  const reorder = useReorderTracks(artistId)
  const ids = release.trackDrafts.map((track) => track.id)
  // Partial lists cannot be reordered safely; the API needs every recording.
  const canReorder =
    draft &&
    ids.length > 1 &&
    release.trackCount === release.trackDrafts.length + release.tracks.length
  const move = (index: number, step: -1 | 1) =>
    reorder.mutate({
      id: release.id,
      trackIds: movedOrder(ids, index, step),
      expectedUpdatedAt: release.updatedAt,
    })
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
      <p>
        Recordings in this release, in running order. Uploaded audio stays
        private.
      </p>
      {reorder.error && (
        <p className="text-sm text-destructive" role="alert">
          {reorder.error.message}
        </p>
      )}
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
          {release.trackDrafts.map((track, index) => (
            <li key={track.id}>
              {canReorder ? (
                <div className="flex shrink-0 flex-col items-center">
                  <Button
                    aria-label={`Move ${track.title} up`}
                    disabled={reorder.isPending || index === 0}
                    onClick={() => move(index, -1)}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </Button>
                  <span className="text-xs tabular-nums text-text-secondary">
                    {index + 1}
                  </span>
                  <Button
                    aria-label={`Move ${track.title} down`}
                    disabled={reorder.isPending || index === ids.length - 1}
                    onClick={() => move(index, 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              ) : (
                <Music2
                  aria-hidden="true"
                  className="size-5 shrink-0 text-accent"
                />
              )}
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
