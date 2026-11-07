import { useId } from 'react'
import { useLandingSignal } from '../model/useLandingSignal'

export function LandingSignal() {
  const { containerRef, spineRef, headRef, layout } = useLandingSignal()
  const id = useId()
  const gradientId = `${id}-signal-gradient`
  const glowId = `${id}-signal-glow`
  return (
    <div
      aria-hidden="true"
      className="artist-landing-signal"
      ref={containerRef}
    >
      {layout ? (
        <svg
          aria-hidden="true"
          className="artist-signal-canvas"
          height={layout.height}
          preserveAspectRatio="none"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0.6" y1="0" y2="1">
              <stop
                offset="0"
                stopColor="var(--color-purple-400)"
                stopOpacity="0"
              />
              <stop offset="0.06" stopColor="var(--color-purple-400)" />
              <stop offset="0.32" stopColor="var(--color-magenta-500)" />
              <stop offset="0.6" stopColor="var(--color-blue-400)" />
              <stop offset="0.78" stopColor="var(--color-emerald-300)" />
              <stop offset="1" stopColor="var(--color-purple-400)" />
            </linearGradient>
            <radialGradient id={glowId}>
              <stop
                offset="0"
                stopColor="var(--color-purple-300)"
                stopOpacity="0.2"
              />
              <stop
                offset="0.2"
                stopColor="var(--color-purple-500)"
                stopOpacity="0.08"
              />
              <stop
                offset="1"
                stopColor="var(--color-purple-500)"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>
          <g stroke={`url(#${gradientId})`}>
            <path
              className="artist-signal-surface"
              d={layout.surface}
              fill={`url(#${gradientId})`}
            />
            {layout.strands.map(({ id: strandId, d }) => (
              <path className="artist-signal-strand" d={d} key={strandId} />
            ))}
            <path
              className="artist-signal-trail"
              d={layout.spine}
              pathLength={1000}
              ref={spineRef}
            />
          </g>
          <g className="artist-signal-head" ref={headRef}>
            <circle fill={`url(#${glowId})`} r={90} />
            <circle className="artist-signal-core" r={1.5} />
          </g>
        </svg>
      ) : null}
    </div>
  )
}
