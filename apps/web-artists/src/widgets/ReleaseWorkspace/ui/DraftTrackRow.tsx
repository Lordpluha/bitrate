import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import { TrackPlayer } from '@entities/release'
import { useI18n } from '@shared/i18n'
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
  /** Release artwork shown by the player; null until a cover is uploaded. */
  coverUrl: string | null
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
  coverUrl,
  track,
  index,
  count,
  editable,
  reorder,
  onAction,
}: DraftTrackRowProps) {
  const { t } = useI18n()
  return (
    <li>
      {reorder ? (
        <div className="flex shrink-0 flex-col items-center">
          <Button
            aria-label={t('workspace.track.moveUp', { title: track.title })}
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
            aria-label={t('workspace.track.moveDown', { title: track.title })}
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
          {t(trackVersionLabels[track.version])} ·{' '}
          {durationLabel(track.duration, t)}
          {track.isDemo ? ` · ${t('labels.trackVersion.demo')}` : ''}
        </p>
        <p>{isrcLabel(track.isrc, t)}</p>
        <p className="flex items-center gap-1">
          {!track.hasAudio && (
            <CircleAlert
              aria-hidden="true"
              className="size-4 shrink-0 text-destructive"
            />
          )}
          <span className="truncate">{audioLabel(track, t)}</span>
        </p>
        {track.hasAudio && (
          <TrackPlayer
            className="mt-2"
            coverUrl={coverUrl}
            releaseId={releaseId}
            title={track.title}
            trackId={track.id}
          />
        )}
      </div>
      <span className="artist-release-track-status" data-status={track.status}>
        {t(trackStatusLabels[track.status])}
      </span>
      {editable && (
        <div className="flex flex-wrap gap-2">
          <Button
            aria-label={t(
              track.hasAudio
                ? 'workspace.track.replaceAudioFor'
                : 'workspace.track.uploadAudioFor',
              { title: track.title },
            )}
            onClick={() => onAction({ kind: 'track-audio', trackId: track.id })}
            size="sm"
            variant="outline"
          >
            {track.hasAudio
              ? t('workspace.track.replaceAudio')
              : t('workspace.track.uploadAudio')}
          </Button>
          <Button
            aria-label={t('workspace.track.renameFor', { title: track.title })}
            onClick={() =>
              onAction({ kind: 'track-rename', trackId: track.id })
            }
            size="sm"
            variant="outline"
          >
            {t('workspace.track.rename')}
          </Button>
          <Button
            aria-label={t('workspace.track.isrcFor', { title: track.title })}
            onClick={() => onAction({ kind: 'isrc', trackId: track.id })}
            size="sm"
            variant="outline"
          >
            ISRC
          </Button>
          <Button
            aria-label={t('workspace.track.removeFor', { title: track.title })}
            onClick={() =>
              onAction({ kind: 'track-remove', trackId: track.id })
            }
            size="sm"
            variant="ghost"
          >
            {t('workspace.track.remove')}
          </Button>
        </div>
      )}
    </li>
  )
}
