'use client'

import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { NowPlayingView } from './NowPlayingView'

type PlayerResponsiveViewsProps = {
  artist: string
  coverUrl: string
  floatingWindow: Window | null
  isExpanded: boolean
  isLiked: boolean
  onCloseExpanded: () => void
  onLikeToggle: () => void
  onNext: () => void
  onPrevious: () => void
  onVolumeChange: (volume: number) => void
  playlistTitle: string
  title: string
  volume: number
}

export const PlayerResponsiveViews = ({
  artist,
  coverUrl,
  floatingWindow,
  isExpanded,
  isLiked,
  onCloseExpanded,
  onLikeToggle,
  onNext,
  onPrevious,
  onVolumeChange,
  playlistTitle,
  title,
  volume,
}: PlayerResponsiveViewsProps) => (
  <>
    <FloatingPlayerWindow targetWindow={floatingWindow} />

    <NowPlayingView
      artist={artist}
      coverUrl={coverUrl}
      isLiked={isLiked}
      isOpen={isExpanded}
      onClose={onCloseExpanded}
      onLikeToggle={onLikeToggle}
      onNext={onNext}
      onPrevious={onPrevious}
      onVolumeChange={onVolumeChange}
      playlistTitle={playlistTitle}
      title={title}
      volume={volume}
    />
  </>
)
