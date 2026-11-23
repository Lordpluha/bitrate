import { AudioLines, Pause, Play } from 'lucide-react'
import { useI18n } from '@/shared/i18n'

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
}: TrackPlayIndicatorProps) => {
  const { t } = useI18n()
  const isPlayingNow = isCurrent && isPlaying
  const action = t(isPlayingNow ? 'common.pauseName' : 'common.playName', {
    name: title,
  })
  /** The number is the visible label unless the track is playing, so it leads the name. */
  const label = isPlayingNow ? action : `${index + 1}. ${action}`

  return (
    <button
      aria-label={label}
      className="relative flex items-center justify-center text-[13px] font-semibold track-rows:hidden"
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
            className="text-text-brand group-hover:hidden"
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
          <span className="text-text-brand group-hover:hidden">
            {index + 1}
          </span>
          <Play
            aria-hidden="true"
            className="text-text-brand hidden group-hover:block"
            fill="currentColor"
            size={14}
          />
        </>
      )}
    </button>
  )
}
