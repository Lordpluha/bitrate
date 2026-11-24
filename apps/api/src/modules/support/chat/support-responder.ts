import type { RespondInput, SupportEvent } from '@bitrate/support-core'

/** The part of `SupportAgent` a turn uses; absent when the assistant is not configured. */
export interface SupportResponder {
  respond(input: RespondInput): AsyncIterable<SupportEvent>
}
