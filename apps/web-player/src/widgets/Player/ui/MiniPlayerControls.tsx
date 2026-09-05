import {
  CheckCircle2,
  CirclePlus,
  MonitorSpeaker,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react'

type MiniPlayerControlsProps = {
  isLiked: boolean
  isPlaying: boolean
  onLikeToggle?: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
}

const buttonClass =
  'flex size-11 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'

export const MiniPlayerControls = ({
  isLiked,
  isPlaying,
  onLikeToggle,
  onNext,
  onPlayPause,
  onPrevious,
}: MiniPlayerControlsProps) => (
  <div className="flex shrink-0 items-center gap-0.5 min-[520px]:gap-1">
    <button
      aria-label={isLiked ? 'Saved to library' : 'Add to library'}
      aria-pressed={isLiked}
      className={`${buttonClass} disabled:opacity-50`}
      disabled={!onLikeToggle}
      onClick={onLikeToggle}
      type="button"
    >
      {isLiked ? (
        <CheckCircle2
          className="fill-green-500 text-black"
          size={24}
          strokeWidth={2.5}
        />
      ) : (
        <CirclePlus aria-hidden="true" size={24} />
      )}
    </button>
    <button
      aria-label="Connect to a device"
      className={`${buttonClass} hidden min-[620px]:flex`}
      type="button"
    >
      <MonitorSpeaker aria-hidden="true" size={22} />
    </button>
    <button
      aria-label="Previous track"
      className={buttonClass}
      onClick={onPrevious}
      type="button"
    >
      <SkipBack
        aria-hidden="true"
        fill="currentColor"
        size={22}
        strokeWidth={2}
      />
    </button>
    <button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className={`${buttonClass} text-white transition-transform hover:scale-105`}
      onClick={onPlayPause}
      type="button"
    >
      {isPlaying ? (
        <Pause aria-hidden="true" size={25} strokeWidth={3} />
      ) : (
        <Play
          aria-hidden="true"
          fill="currentColor"
          size={25}
          strokeWidth={2}
        />
      )}
    </button>
    <button
      aria-label="Next track"
      className={buttonClass}
      onClick={onNext}
      type="button"
    >
      <SkipForward
        aria-hidden="true"
        fill="currentColor"
        size={22}
        strokeWidth={2}
      />
    </button>
  </div>
)
