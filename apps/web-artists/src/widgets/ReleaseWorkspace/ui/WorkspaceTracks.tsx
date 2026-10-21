import { Button } from '@bitrate/ui-react'
import { type ReleaseWorkspace, useReorderTracks } from '@entities/release'
import { Music2, Upload } from 'lucide-react'
import { durationLabel, isrcLabel } from '../lib/trackLabels'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { DraftTrackRow } from './DraftTrackRow'

interface WorkspaceTracksProps {
  artistId: string
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

/** Swaps a recording with its neighbour; the API receives the whole new order. */
function movedOrder(ids: string[], index: number, step: -1 | 1) {
  const next = [...ids]
  const target = index + step
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function WorkspaceTracks({
  artistId,
  release,
  onAction,
}: WorkspaceTracksProps) {
  const draft = release.status === 'DRAFT'
  const shown = release.trackDrafts.length + release.tracks.length
  const reorder = useReorderTracks(artistId)
  const ids = release.trackDrafts.map((track) => track.id)
  // Partial lists cannot be reordered safely; the API needs every recording.
  const canReorder = draft && ids.length > 1 && release.trackCount === shown
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
          <Button
            onClick={() => onAction({ kind: 'track-add' })}
            size="sm"
            variant="outline"
          >
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
            <DraftTrackRow
              count={ids.length}
              editable={draft}
              index={index}
              key={track.id}
              onAction={onAction}
              releaseId={release.id}
              reorder={
                canReorder
                  ? {
                      pending: reorder.isPending,
                      onMove: (step) => move(index, step),
                    }
                  : undefined
              }
              track={track}
            />
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
                <p>Linked recording · {durationLabel(track.duration)}</p>
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
