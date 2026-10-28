'use client'

import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

type DesktopPlayerBarProps = {
  artist: string
  coverUrl: string
  isLiked: boolean
  isVisible: boolean
  onExpand: () => void
  onLikeToggle: () => void
  onNext: () => void
  onPictureInPicture: () => void
  onPrevious: () => void
  onVolumeChange: (volume: number) => void
  title: string
  volume: number
}

export const DesktopPlayerBar = ({
  artist,
  coverUrl,
  isLiked,
  isVisible,
  onExpand,
  onLikeToggle,
  onNext,
  onPictureInPicture,
  onPrevious,
  onVolumeChange,
  title,
  volume,
}: DesktopPlayerBarProps) => (
  <div
    className={`fixed inset-x-4 bottom-4 z-50 hidden h-22 items-center gap-6 rounded-2xl border border-border bg-card px-5.5 shadow-2xl transition-transform duration-300 ease-in-out xl:flex ${
      isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+16px)]'
    }`}
  >
    <div className="w-80 min-w-0 shrink-0">
      <TrackInfo
        artist={artist}
        coverUrl={coverUrl}
        isLiked={isLiked}
        onLikeToggle={onLikeToggle}
        title={title}
      />
    </div>

    <div className="flex min-w-0 flex-1 justify-center">
      <PlayerControls onNext={onNext} onPrevious={onPrevious} />
    </div>

    <div className="flex shrink-0 justify-end">
      <PlayerActions
        onExpand={onExpand}
        onPictureInPicture={onPictureInPicture}
        onVolumeChange={onVolumeChange}
        volume={volume}
      />
    </div>
  </div>
)
