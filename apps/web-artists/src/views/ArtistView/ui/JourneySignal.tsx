import type { CSSProperties } from 'react'

/** A deterministic soundprint: stable during hydration, animated with transforms only. */
const SIGNAL_BARS = Array.from({ length: 72 }, (_, index) => {
  const angle = (index / 72) * Math.PI * 2 - Math.PI / 2
  const length = 5 + (Math.sin(index * 1.7) * 0.5 + 0.5) * 15
  return {
    id: `signal-${index}`,
    x1: (180 + Math.cos(angle) * 151).toFixed(3),
    y1: (180 + Math.sin(angle) * 151).toFixed(3),
    x2: (180 + Math.cos(angle) * (151 + length)).toFixed(3),
    y2: (180 + Math.sin(angle) * (151 + length)).toFixed(3),
  }
})

const SIGNAL_PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  id: `particle-${index}`,
  style: {
    '--particle-angle': `${index * 30 + 8}deg`,
    '--particle-distance': `${index % 2 ? 9 : 7}rem`,
    '--particle-delay': `${(index % 4) * 90}ms`,
  } as CSSProperties,
}))

export function JourneySignal() {
  return (
    <div aria-hidden="true" className="artist-journey-signal">
      <svg
        aria-hidden="true"
        className="artist-journey-soundprint"
        viewBox="0 0 360 360"
      >
        <circle className="artist-journey-orbit" cx="180" cy="180" r="143" />
        <g className="artist-journey-signal-bars">
          {SIGNAL_BARS.map(({ id, ...coordinates }) => (
            <line key={id} {...coordinates} />
          ))}
        </g>
        <circle
          className="artist-journey-signal-progress"
          cx="180"
          cy="180"
          pathLength="1"
          r="175"
        />
        <g className="artist-journey-signal-spin">
          <circle
            className="artist-journey-signal-comet"
            cx="180"
            cy="180"
            r="175"
          />
          <circle
            className="artist-journey-signal-spark"
            cx="180"
            cy="5"
            r="3"
          />
          <circle
            className="artist-journey-signal-spark"
            cx="180"
            cy="355"
            r="2"
          />
        </g>
      </svg>
      <span className="artist-journey-broadcast artist-journey-broadcast-one" />
      <span className="artist-journey-broadcast artist-journey-broadcast-two" />
      {SIGNAL_PARTICLES.map(({ id, style }) => (
        <span className="artist-journey-particle" key={id} style={style} />
      ))}
    </div>
  )
}
