import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import styles from '@/widgets/Player/ui/FloatingPlayerWindow.module.css'

type FloatingPlayerActionsProps = {
  isPlaying: boolean
  onClose: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
}

export const FloatingPlayerActions = ({
  isPlaying,
  onClose,
  onNext,
  onPlayPause,
  onPrevious,
}: FloatingPlayerActionsProps) => (
  <div className={styles.actions}>
    <button
      aria-label="Previous track"
      className={styles.iconButton}
      onClick={onPrevious}
      type="button"
    >
      <SkipBack fill="currentColor" size={18} />
    </button>
    <button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className={styles.playButton}
      onClick={onPlayPause}
      type="button"
    >
      {isPlaying ? (
        <Pause fill="currentColor" size={20} />
      ) : (
        <Play fill="currentColor" size={20} />
      )}
    </button>
    <button
      aria-label="Next track"
      className={styles.iconButton}
      onClick={onNext}
      type="button"
    >
      <SkipForward fill="currentColor" size={18} />
    </button>
    <button
      aria-label="Close floating player"
      className={styles.iconButton}
      onClick={onClose}
      type="button"
    >
      <X size={16} />
    </button>
  </div>
)
