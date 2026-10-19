import type { TrackEntity } from '@entities/Track'
import { QueueTrackRow } from './QueueTrackRow'

type QueueTrackEntry = {
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
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ul className="flex flex-col">
        {entries.map(({ key, ...rowProps }) => (
          <QueueTrackRow key={key} {...rowProps} />
        ))}
      </ul>
    </section>
  )
}
