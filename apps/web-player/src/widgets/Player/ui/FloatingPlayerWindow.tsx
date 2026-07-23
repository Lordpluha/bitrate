'use client'

import { createPortal } from 'react-dom'
import { useFloatingPlayerStyles } from '@/widgets/Player/model/useFloatingPlayerStyles'
import { FloatingPlayerActions } from '@/widgets/Player/ui/FloatingPlayerActions'
import { FloatingPlayerProgress } from '@/widgets/Player/ui/FloatingPlayerProgress'
import styles from '@/widgets/Player/ui/FloatingPlayerWindow.module.css'

interface FloatingPlayerWindowProps {
  targetWindow: Window | null
  title: string
  artist: string
  coverUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onSeek: (time: number) => void
  onClose: () => void
}

export const FloatingPlayerWindow = ({
  targetWindow,
  title,
  artist,
  coverUrl,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onClose,
}: FloatingPlayerWindowProps) => {
  useFloatingPlayerStyles(targetWindow)

  if (!targetWindow || targetWindow.closed) return null

  return createPortal(
    <div className={styles.root}>
      {/* biome-ignore lint/performance/noImgElement: rendered into an external Picture-in-Picture document */}
      <img alt={title} className={styles.cover} src={coverUrl} />

      <div className={styles.details}>
        <div className={styles.title}>{title}</div>
        <div className={styles.artist}>{artist}</div>
        <FloatingPlayerProgress
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      <FloatingPlayerActions
        isPlaying={isPlaying}
        onClose={onClose}
        onNext={onNext}
        onPlayPause={onPlayPause}
        onPrevious={onPrevious}
      />
    </div>,
    targetWindow.document.body,
  )
}
