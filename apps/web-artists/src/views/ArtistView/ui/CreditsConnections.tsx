import type { CreditsSceneConnections } from '../model/useCreditsScene'

export function CreditsConnections({
  connections,
  selected,
}: {
  connections: CreditsSceneConnections | null
  selected: number
}) {
  if (!connections) return null
  return (
    <svg
      aria-hidden="true"
      className="artist-credits-connections"
      preserveAspectRatio="none"
      viewBox={`0 0 ${connections.width} ${connections.height}`}
    >
      {connections.paths.map(({ id, d }) => (
        <g key={id}>
          <path className="artist-credits-connection-track" d={d} />
          <path
            className="artist-credits-connection-light"
            d={d}
            key={selected}
            pathLength={1000}
          />
        </g>
      ))}
    </svg>
  )
}
