import type { Audience, Locale } from '../domain.js'
import { readSupportStream } from './read-support-stream.js'
import type { ClientSupportEvent } from './support-client-event.js'
import { type SupportConversationView, toConversationView } from './to-conversation-view.js'

/** A non-2xx answer: 404 (gone or not yours), 409 (a reply is streaming), 429 (too many). */
export class SupportClientError extends Error {
  constructor(readonly status: number) {
    super(`Support request failed with ${status}`)
    this.name = 'SupportClientError'
  }
}

export interface SupportClientOptions {
  /** API origin, e.g. `https://api.bitrate.me`. */
  baseUrl: string
  /** A `fetch` that sends cookies (`credentials: 'include'`); apps pass their refreshing one. */
  fetch?: typeof fetch
}

/** A started conversation; `token` is present for guests and must be kept to reopen it. */
export interface StartedConversation {
  conversation: SupportConversationView
  token?: string
}

const TOKEN_HEADER = 'x-support-token'

/** Browser client of the support chat API (#571), shared by the web apps. */
export function createSupportClient({ baseUrl, fetch: send = fetch }: SupportClientOptions) {
  const url = (path: string) => `${baseUrl}/api/v1/support/conversations${path}`
  const request = async (path: string, init: RequestInit, token?: string) => {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    if (token) headers.set(TOKEN_HEADER, token)
    const response = await send(url(path), { ...init, headers, credentials: 'include' })
    if (!response.ok) throw new SupportClientError(response.status)
    return response
  }

  return {
    async start(audience: Audience, locale?: Locale): Promise<StartedConversation> {
      const response = await request('', {
        method: 'POST',
        body: JSON.stringify(locale ? { audience, locale } : { audience }),
      })
      const body: unknown = await response.json()
      if (typeof body !== 'object' || body === null || !('conversation' in body)) {
        throw new Error('Unexpected support conversation response')
      }
      const conversation = toConversationView(body.conversation)
      const token = 'token' in body ? body.token : undefined
      return typeof token === 'string' ? { conversation, token } : { conversation }
    },

    async load(id: string, token?: string): Promise<SupportConversationView> {
      const response = await request(`/${encodeURIComponent(id)}`, { method: 'GET' }, token)
      return toConversationView(await response.json())
    },

    async *send(
      id: string,
      text: string,
      token?: string,
      signal?: AbortSignal,
    ): AsyncGenerator<ClientSupportEvent> {
      const init: RequestInit = { method: 'POST', body: JSON.stringify({ text }) }
      const response = await request(
        `/${encodeURIComponent(id)}/messages`,
        signal ? { ...init, signal } : init,
        token,
      )
      if (!response.body) return
      yield* readSupportStream(response.body)
    },
  }
}

export type SupportClient = ReturnType<typeof createSupportClient>
