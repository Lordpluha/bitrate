import type { Citation, ConversationState } from '../domain.js'

export interface SupportMessageView {
  id: string
  role: 'user' | 'assistant' | 'operator'
  text: string
  citations: Citation[]
}

export interface SupportConversationView {
  id: string
  state: ConversationState
  messages: SupportMessageView[]
}

type Fields = Record<string, unknown>
const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null
const ROLES = ['user', 'assistant', 'operator'] as const
const STATES = ['bot', 'waiting_operator', 'operator', 'resolved'] as const

/** `GET /v1/support/conversations/:id` as a view; throws on a response of another shape. */
export function toConversationView(data: unknown): SupportConversationView {
  const state = isFields(data) ? STATES.find((known) => known === data.state) : undefined
  if (!(isFields(data) && typeof data.id === 'string' && state && Array.isArray(data.messages))) {
    throw new Error('Unexpected support conversation response')
  }
  const messages = data.messages.flatMap((message: unknown) => {
    if (!isFields(message) || typeof message.id !== 'string' || typeof message.text !== 'string') {
      return []
    }
    const role = ROLES.find((known) => known === message.role)
    if (!role) return []
    const citations = Array.isArray(message.citations)
      ? message.citations.filter(
          (citation: unknown): citation is Citation =>
            isFields(citation) &&
            typeof citation.chunkId === 'string' &&
            typeof citation.title === 'string',
        )
      : []
    return [{ id: message.id, role, text: message.text, citations }]
  })
  return { id: data.id, state, messages }
}
