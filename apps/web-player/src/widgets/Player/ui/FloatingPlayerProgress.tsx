import type { CSSProperties } from 'react'
import styles from '@/widgets/Player/ui/FloatingPlayerWindow.module.css'

type ProgressStyle = CSSProperties & {
  '--floating-progress': string
}

type FloatingPlayerProgressProps = {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const FloatingPlayerProgress = ({
  currentTime,
  duration,
  onSeek,
}: FloatingPlayerProgressProps) => {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const safeCurrentTime = Math.min(currentTime, safeDuration)
  const progress =
    safeDuration > 0 ? Math.min((safeCurrentTime / safeDuration) * 100, 100) : 0
  const progressStyle: ProgressStyle = {
    '--floating-progress': `${progress}%`,
  }

  return (
    <div className={styles.progress}>
      <span className={`${styles.time} ${styles.timeElapsed}`}>
        {formatTime(currentTime)}
      </span>
      <input
        aria-label="Seek track"
        className={styles.range}
        max={safeDuration}
        min={0}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
        step={0.1}
        style={progressStyle}
        type="range"
        value={safeCurrentTime}
      />
      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  )
}
