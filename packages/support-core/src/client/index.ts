/** Browser client of the support chat (`@bitrate/support-core/client`), shared by the web apps. */
export {
  createSupportClient,
  type StartedConversation,
  type SupportClient,
  SupportClientError,
  type SupportClientOptions,
} from './create-support-client.js'
export type { ClientSupportEvent } from './support-client-event.js'
export type { SupportConversationView, SupportMessageView } from './to-conversation-view.js'
export { applySupportEvent } from './apply-support-event.js'
export {
  type ChatMessage,
  type ChatStatus,
  EMPTY_CHAT_STATE,
  type SupportChatState,
} from './chat-state.js'
export { chatStateFromView } from './chat-state-from-view.js'
export { failSupportTurn } from './fail-support-turn.js'
export { startSupportTurn } from './start-support-turn.js'
export {
  OPERATOR_POLL_INTERVAL_MS,
  type WatchOperatorRepliesInput,
  watchOperatorReplies,
} from './watch-operator-replies.js'
