import type { SupportEvent } from '@bitrate/support-core'

/**
 * One SSE frame named after the event type. The payload is the event without `type` and,
 * for `done`, without `usage`: token counts are the operator's business, not the client's.
 */
export function formatEvent(event: SupportEvent): string {
  const { type, ...rest } = event
  const data = event.type === 'done' ? { outcome: event.outcome, grounded: event.grounded } : rest
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
}
