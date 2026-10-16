import type { DeliveryDestination, DeliveryState } from '@prisma/client'

/** DI token for the single distribution partner behind Bitrate (tech-roadmap: one partner first). */
export const DISTRIBUTION_ADAPTER = Symbol('DISTRIBUTION_ADAPTER')

export interface DeliverySubmission {
  releaseId: string
  destinations: DeliveryDestination[]
  /** ISO 3166-1 alpha-2 codes; empty means worldwide. */
  territories: string[]
}

export interface DeliveryReceipt {
  destination: DeliveryDestination
  state: DeliveryState
  externalId?: string
  message?: string
}

/**
 * The one interface a distribution partner implements. Deliberately not a multi-partner
 * abstraction: when a partner is confirmed, its client implements this and replaces the
 * not-connected binding in the module.
 */
export interface DistributionAdapter {
  /** Partner display name, or null while none is connected. */
  readonly partner: string | null
  isConnected(): boolean
  /** Whether the connected partner can deliver to this store. */
  supports(destination: DeliveryDestination): boolean
  submit(submission: DeliverySubmission): Promise<DeliveryReceipt[]>
}

/** The honest default: no partner, nothing can be sent, every store reads Not connected. */
export class NotConnectedDistributionAdapter implements DistributionAdapter {
  readonly partner = null

  isConnected(): boolean {
    return false
  }

  supports(_destination: DeliveryDestination): boolean {
    return false
  }

  /** Sends nothing and reports no receipts; callers check `isConnected` before offering it. */
  submit(_submission: DeliverySubmission): Promise<DeliveryReceipt[]> {
    return Promise.resolve([])
  }
}
