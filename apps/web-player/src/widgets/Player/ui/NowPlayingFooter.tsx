import type {
  NowPlayingPlaybackProps,
  NowPlayingTrackProps,
  NowPlayingViewProps,
} from './nowPlaying.types'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

type NowPlayingFooterProps = NowPlayingPlaybackProps &
  NowPlayingTrackProps &
  Pick<NowPlayingViewProps, 'onVolumeChange' | 'volume'>

export const NowPlayingFooter = ({
  artist,
  coverUrl,
  currentTime,
  duration,
  isLiked,
  isPlaying,
  onLikeToggle,
  onNext,
  onPlayPause,
  onPrevious,
  onSeek,
  onVolumeChange,
  title,
  volume,
}: NowPlayingFooterProps) => (
  <div className="fixed inset-x-0 bottom-0 z-30 w-full border-t border-white/10 bg-black/65 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
    <div className="mx-auto w-full max-w-7xl">
      <div className="hidden items-center justify-between gap-4 xl:flex">
        <div className="w-[28%] min-w-0">
          <TrackInfo
            artist={artist}
            coverUrl={coverUrl}
            isLiked={Boolean(isLiked)}
            onLikeToggle={onLikeToggle}
            title={title}
          />
        </div>
        <div className="flex w-[44%] justify-center">
          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onNext={onNext}
            onPlayPause={onPlayPause}
            onPrevious={onPrevious}
            onSeek={onSeek}
          />
        </div>
        <div className="flex w-[28%] justify-end">
          <PlayerActions onVolumeChange={onVolumeChange} volume={volume} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-122 xl:hidden">
        <PlayerControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onNext={onNext}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onSeek={onSeek}
        />
      </div>
    </div>
  </div>
)
