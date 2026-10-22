import { cn } from '@bitrate/ui-react'
import {
  availabilityLabels,
  type DestinationAvailability,
  type ReleaseDelivery,
} from '@entities/delivery'
import { destinationLabels } from '@shared/constants/destinations'

/** Live and failed carry meaning; everything else is neutral so nothing looks sent by accident. */
const tone: Record<DestinationAvailability, string> = {
  NOT_CONNECTED: 'text-text-secondary',
  UNAVAILABLE: 'text-text-secondary',
  NOT_SENT: 'text-text-secondary',
  PENDING: 'text-accent',
  LIVE: 'text-accent font-medium',
  FAILED: 'text-destructive font-medium',
  TAKEN_DOWN: 'text-text-secondary',
}

interface DestinationStatesProps {
  delivery: ReleaseDelivery
  /** Show only stores in the plan, as the compact Distribution rows do. */
  plannedOnly?: boolean
}

export function DestinationStates({
  delivery,
  plannedOnly = false,
}: DestinationStatesProps) {
  const items = plannedOnly
    ? delivery.destinations.filter((item) => item.planned)
    : delivery.destinations
  if (items.length === 0)
    return <p className="text-sm text-text-secondary">No stores planned.</p>
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm',
            !item.planned && 'opacity-60',
          )}
          key={item.destination}
        >
          <span>
            {destinationLabels[item.destination]}
            {!item.planned && (
              <span className="sr-only"> (not in the plan)</span>
            )}
          </span>
          <span
            className={cn('text-xs', tone[item.availability])}
            title={item.message ?? undefined}
          >
            {availabilityLabels[item.availability]}
          </span>
        </li>
      ))}
    </ul>
  )
}
