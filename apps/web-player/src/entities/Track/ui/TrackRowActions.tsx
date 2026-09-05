import { AddToQueueButton } from '@entities/Player'
import { formatDuration } from '@shared/utils/apiHelpers'
import { X } from 'lucide-react'
import type { TrackEntity } from '../models/schema/Track.entity'
import { LikeTrackButton } from './LikeTrackButton'

type TrackRowActionsProps = {
  isLiked: boolean
  onRemove?: () => void
  removable: boolean
  track: TrackEntity
}

export const TrackRowActions = ({
  isLiked,
  onRemove,
  removable,
  track,
}: TrackRowActionsProps) => (
  <>
    <div className="grid grid-cols-[24px_24px_44px_24px] items-center justify-end gap-2 text-sm text-text-subdued max-[1024px]:hidden">
      <div className="flex justify-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <AddToQueueButton track={track} />
      </div>
      <div className="flex justify-center">
        <LikeTrackButton
          initialLiked={isLiked}
          trackId={track.id}
          trackTitle={track.title}
        />
      </div>
      <span className="text-right">{formatDuration(track.duration ?? 0)}</span>
      {removable && (
        <button
          aria-label={`Remove ${track.title} from playlist`}
          className="rounded-full p-1 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 focus-visible:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      )}
    </div>

    <div className="hidden shrink-0 grid-cols-[24px_auto] items-center justify-end gap-2 text-xs text-text-subdued max-[1024px]:grid">
      <LikeTrackButton
        initialLiked={isLiked}
        trackId={track.id}
        trackTitle={track.title}
      />
      {removable ? (
        <button
          aria-label={`Remove ${track.title} from playlist`}
          className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-text"
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
