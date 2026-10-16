import { DeliveryState } from '@prisma/client'

/**
 * Allowed partner-reported transitions (tech-roadmap delivery states). `null` is "never sent".
 * A failed or taken-down delivery can be submitted again; live content can only be taken down.
 */
const TRANSITIONS: Record<DeliveryState | 'NONE', readonly DeliveryState[]> = {
  NONE: [DeliveryState.SUBMITTED],
  [DeliveryState.SUBMITTED]: [DeliveryState.ACCEPTED, DeliveryState.FAILED],
  [DeliveryState.ACCEPTED]: [DeliveryState.LIVE, DeliveryState.FAILED],
  [DeliveryState.LIVE]: [DeliveryState.TAKEN_DOWN],
  [DeliveryState.FAILED]: [DeliveryState.SUBMITTED],
  [DeliveryState.TAKEN_DOWN]: [DeliveryState.SUBMITTED],
}

export function canTransition(from: DeliveryState | null, to: DeliveryState): boolean {
  return TRANSITIONS[from ?? 'NONE'].includes(to)
}

/** What the artist sees per store; `NOT_CONNECTED` and `UNAVAILABLE` never imply a sent release. */
export type DestinationAvailability =
  | 'NOT_CONNECTED'
  | 'UNAVAILABLE'
  | 'NOT_SENT'
  | 'PENDING'
  | 'LIVE'
  | 'FAILED'
  | 'TAKEN_DOWN'

export function availabilityFromState(state: DeliveryState): DestinationAvailability {
  switch (state) {
    case DeliveryState.SUBMITTED:
    case DeliveryState.ACCEPTED:
      return 'PENDING'
    case DeliveryState.LIVE:
      return 'LIVE'
    case DeliveryState.FAILED:
      return 'FAILED'
    case DeliveryState.TAKEN_DOWN:
      return 'TAKEN_DOWN'
  }
}
