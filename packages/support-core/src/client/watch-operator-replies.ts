import type { SupportChatState } from './chat-state.js'
import { chatStateFromView } from './chat-state-from-view.js'
import type { SupportConversationView } from './to-conversation-view.js'

/** How often the widget checks for an operator's reply. */
export const OPERATOR_POLL_INTERVAL_MS = 10_000

export interface WatchOperatorRepliesInput {
  /** Loads the conversation (`client.load` with its id and token). */
  load: () => Promise<SupportConversationView>
  /** Receives the reloaded chat; `idle` once the operator resolved it. */
  onState: (state: SupportChatState) => void
  intervalMs?: number
  /** A hidden tab skips the tick: nobody is reading, and the next visible tick catches up. */
  isHidden?: () => boolean
}

/**
 * Reloads the conversation on an interval while an operator holds it: their replies arrive
 * outside the user's own turn, so no stream carries them (#573). Returns the stop function.
 */
export function watchOperatorReplies({
  load,
  onState,
  intervalMs = OPERATOR_POLL_INTERVAL_MS,
  isHidden = () => false,
}: WatchOperatorRepliesInput): () => void {
  let stopped = false
  const tick = async () => {
    if (isHidden()) return
    try {
      const view = await load()
      if (!stopped) onState(chatStateFromView(view))
    } catch {
      // Offline or briefly failing: the next tick tries again.
    }
  }
  const timer = setInterval(() => void tick(), intervalMs)
  return () => {
    stopped = true
    clearInterval(timer)
  }
}
