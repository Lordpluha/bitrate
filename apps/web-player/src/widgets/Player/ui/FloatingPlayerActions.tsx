import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
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
}: FloatingPlayerActionsProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.actions}>
      <button
        aria-label={t('player.previous')}
        className={styles.iconButton}
        onClick={onPrevious}
        type="button"
      >
        <SkipBack fill="currentColor" size={18} />
      </button>
      <button
        aria-label={isPlaying ? t('trackMenu.pause') : t('trackMenu.play')}
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
        aria-label={t('player.next')}
        className={styles.iconButton}
        onClick={onNext}
        type="button"
      >
        <SkipForward fill="currentColor" size={18} />
      </button>
      <button
        aria-label={t('player.closeFloating')}
        className={styles.iconButton}
        onClick={onClose}
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  )
}
