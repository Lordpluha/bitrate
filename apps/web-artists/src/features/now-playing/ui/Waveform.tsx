import { cn } from '@bitrate/ui-react'
import { formatDuration } from '@shared/lib/format'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { downsamplePeaks } from '../model/peaks'

/** Bar width plus the gap after it, in CSS pixels; keep in step with NowPlaying.css. */
const BAR_PITCH = 4
const BAR_GAP = 2

/**
 * As many bars as fit at a whole-pixel pitch, so every bar renders the same width; before the
 * first measurement, `fallback` bars.
 */
function useBarCount(fallback: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(fallback)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () =>
      setCount(
        Math.max(8, Math.floor((node.clientWidth + BAR_GAP) / BAR_PITCH)),
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return { ref, count }
}

interface WaveformProps {
  peaks: readonly number[]
  /** How many bars to draw until the width is known. */
  bars: number
  /** Played share, 0–1. */
  progress: number
  /** Accessible name of the seek slider. */
  label: string
  /** Seconds; with `onSeek`, the waveform becomes a seek slider. */
  duration?: number
  currentTime?: number
  onSeek?: (seconds: number) => void
  className?: string
}

/** A recording's peaks as bars, the played part highlighted; seekable when it is playing. */
export function Waveform({
  peaks,
  bars,
  progress,
  label,
  duration = 0,
  currentTime = 0,
  onSeek,
  className,
}: WaveformProps) {
  const { ref, count } = useBarCount(bars)
  const levels = useMemo(
    () =>
      downsamplePeaks(peaks, count).map((level, position) => ({
        level,
        position,
      })),
    [peaks, count],
  )
  const played = Math.round(progress * levels.length)
  return (
    <div className={cn('artist-waveform', className)}>
      <div aria-hidden="true" className="artist-waveform-bars" ref={ref}>
        {levels.map((bar) => (
          <span
            data-played={bar.position < played}
            key={bar.position}
            style={{
              height: `${bar.level * 100}%`,
              color: `color-mix(in oklab, var(--color-chart-2) ${Math.round((bar.position / Math.max(levels.length - 1, 1)) * 100)}%, var(--color-chart-1))`,
            }}
          />
        ))}
      </div>
      {onSeek && duration > 0 && (
        <input
          aria-label={label}
          aria-valuetext={`${formatDuration(Math.floor(currentTime))} / ${formatDuration(Math.floor(duration))}`}
          className="artist-waveform-seek"
          max={duration}
          min={0}
          onChange={(event) => onSeek(Number(event.target.value))}
          step={1}
          type="range"
          value={Math.min(currentTime, duration)}
        />
      )}
    </div>
  )
}
