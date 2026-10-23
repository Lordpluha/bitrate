import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import { releaseAudioUrl } from '@entities/release'
import { ArrowDown, ArrowUp, CircleAlert, Music2 } from 'lucide-react'
import {
  audioLabel,
  durationLabel,
  isrcLabel,
  type TrackDraft,
} from '../lib/trackLabels'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

/** Move controls, present only when the whole running order is known. */
interface TrackReorder {
  pending: boolean
  onMove: (step: -1 | 1) => void
}

interface DraftTrackRowProps {
  releaseId: string
  track: TrackDraft
  index: number
  count: number
  /** The release is a draft, so its recordings can be edited. */
  editable: boolean
  reorder?: TrackReorder
  onAction: WorkspaceActionHandler
}

/** One uploaded recording of a release, with its audio and draft actions. */
export function DraftTrackRow({
  releaseId,
  track,
  index,
  count,
  editable,
  reorder,
  onAction,
}: DraftTrackRowProps) {
  return (
    <li>
      {reorder ? (
        <div className="flex shrink-0 flex-col items-center">
          <Button
            aria-label={`Move ${track.title} up`}
            disabled={reorder.pending || index === 0}
            onClick={() => reorder.onMove(-1)}
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
            disabled={reorder.pending || index === count - 1}
            onClick={() => reorder.onMove(1)}
            size="icon"
            variant="ghost"
          >
            <ArrowDown aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ) : (
        <Music2 aria-hidden="true" className="size-5 shrink-0 text-accent" />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <h3>{track.title}</h3>
        <p>
          {trackVersionLabels[track.version]} · {durationLabel(track.duration)}
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
            src={releaseAudioUrl(releaseId, track.id)}
          >
            <track kind="captions" />
          </audio>
        )}
      </div>
      <span className="artist-release-track-status" data-status={track.status}>
        {trackStatusLabels[track.status]}
      </span>
      {editable && (
        <div className="flex flex-wrap gap-2">
          <Button
            aria-label={`${track.hasAudio ? 'Replace audio' : 'Upload audio'} for ${track.title}`}
            onClick={() => onAction({ kind: 'track-audio', trackId: track.id })}
            size="sm"
            variant="outline"
          >
            {track.hasAudio ? 'Replace audio' : 'Upload audio'}
          </Button>
          <Button
            aria-label={`Rename ${track.title}`}
            onClick={() =>
              onAction({ kind: 'track-rename', trackId: track.id })
            }
            size="sm"
            variant="outline"
          >
            Rename
          </Button>
          <Button
            aria-label={`Edit ISRC for ${track.title}`}
            onClick={() => onAction({ kind: 'isrc', trackId: track.id })}
            size="sm"
            variant="outline"
          >
            ISRC
          </Button>
          <Button
            aria-label={`Remove ${track.title}`}
            onClick={() =>
              onAction({ kind: 'track-remove', trackId: track.id })
            }
            size="sm"
            variant="ghost"
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  )
}
