import { AddToQueueButton } from '@entities/Player'
import { formatDuration } from '@shared/utils/apiHelpers'
import { X } from 'lucide-react'
import type { TrackEntity } from '../models/schema/Track.entity'
import { LikeTrackButton } from './LikeTrackButton'

type TrackRowActionsProps = {
  onRemove?: () => void
  removable: boolean
  track: TrackEntity
}

export const TrackRowActions = ({
  onRemove,
  removable,
  track,
}: TrackRowActionsProps) => (
  <>
    <div className="flex items-center justify-end gap-2.5 text-[13px] text-muted-foreground tabular-nums max-[1024px]:hidden">
      <AddToQueueButton
        className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        track={track}
      />
      {removable && (
        <button
          aria-label={`Remove ${track.title} from playlist`}
          className="rounded-full p-1 opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100 focus-visible:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      )}
      <LikeTrackButton trackId={track.id} trackTitle={track.title} />
      <span className="min-w-8 text-right">
        {formatDuration(track.duration ?? 0)}
      </span>
    </div>

    <div className="hidden shrink-0 grid-cols-[24px_auto] items-center justify-end gap-2 text-[13px] text-muted-foreground tabular-nums max-[1024px]:grid">
      <LikeTrackButton trackId={track.id} trackTitle={track.title} />
      {removable ? (
        <button
          aria-label={`Remove ${track.title} from playlist`}
          className="rounded-full p-2 transition-colors hover:bg-surface hover:text-foreground"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      ) : (
        <span className="min-w-8 text-right">
          {formatDuration(track.duration ?? 0)}
        </span>
      )}
    </div>
  </>
)
