import type { TranscriptMessage } from '../domain.js'
import type { ModelMessage } from '../ports.js'

/** A stored transcript message as model history; operator replies count as the assistant. */
export function toModelMessage(message: TranscriptMessage): ModelMessage {
  return message.role === 'user'
    ? { role: 'user', content: message.text }
    : { role: 'assistant', content: message.text }
}
