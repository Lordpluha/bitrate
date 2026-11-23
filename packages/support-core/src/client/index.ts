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
