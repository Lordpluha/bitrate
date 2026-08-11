import type { TrackEntity } from '@entities/Track'
import { QueueTrackRow } from './QueueTrackRow'

export type QueueTrackEntry = {
  index?: number
  isActive?: boolean
  key: string
  onPlay?: () => void
  onRemove?: () => void
  track: TrackEntity
}

type QueueTrackSectionProps = {
  entries: QueueTrackEntry[]
  title: string
}

export const QueueTrackSection = ({
  entries,
  title,
}: QueueTrackSectionProps) => {
  if (entries.length === 0) return null

  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-subdued">
        {title}
      </h2>
      <ul>
        {entries.map(({ key, ...rowProps }) => (
          <QueueTrackRow key={key} {...rowProps} />
        ))}
      </ul>
    </section>
  )
}
