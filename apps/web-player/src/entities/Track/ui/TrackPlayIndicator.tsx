import { AudioLines, Pause, Play } from 'lucide-react'

type TrackPlayIndicatorProps = {
  index: number
  isCurrent: boolean
  isPlaying: boolean
  onClick: () => void
  title: string
}

export const TrackPlayIndicator = ({
  index,
  isCurrent,
  isPlaying,
  onClick,
  title,
}: TrackPlayIndicatorProps) => (
  <button
    aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${title}`}
    className="relative flex items-center justify-center text-[13px] font-semibold max-[1024px]:hidden"
    onClick={onClick}
    type="button"
  >
    {!isCurrent && (
      <>
        <span className="text-muted-foreground group-hover:hidden">
          {index + 1}
        </span>
        <Play
          aria-hidden="true"
          className="text-foreground hidden group-hover:block"
          fill="currentColor"
          size={14}
        />
      </>
    )}
    {isCurrent && isPlaying && (
      <>
        <AudioLines
          aria-hidden="true"
          className="text-primary group-hover:hidden"
          size={16}
        />
        <Pause
          aria-hidden="true"
          className="text-foreground hidden group-hover:block"
          fill="currentColor"
          size={14}
        />
      </>
    )}
    {isCurrent && !isPlaying && (
      <>
        <span className="text-primary group-hover:hidden">{index + 1}</span>
        <Play
          aria-hidden="true"
          className="text-primary hidden group-hover:block"
          fill="currentColor"
          size={14}
        />
      </>
    )}
  </button>
)
