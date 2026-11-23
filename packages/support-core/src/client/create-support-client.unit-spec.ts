import { describe, expect, it } from 'vitest'
import { createSupportClient, SupportClientError } from './create-support-client.js'

const conversation = { id: 'c1', state: 'bot', messages: [] }

function fakeFetch(respond: (url: string, init: RequestInit) => Response) {
  const calls: { url: string; init: RequestInit }[] = []
  const fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(input), init })
    return Promise.resolve(respond(String(input), init))
  }
  return { fetch: fetch as typeof globalThis.fetch, calls }
}

describe('createSupportClient', () => {
  it('starts a guest conversation and keeps the returned token', async () => {
    const { fetch, calls } = fakeFetch(() =>
      Response.json({ conversation, token: 'secret' }, { status: 201 }),
    )
    const client = createSupportClient({ baseUrl: 'https://api.test', fetch })

    const started = await client.start('artist', 'pl')

    expect(started).toEqual({ conversation, token: 'secret' })
    expect(calls[0]?.url).toBe('https://api.test/api/v1/support/conversations')
    expect(calls[0]?.init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(calls[0]?.init.body).toBe('{"audience":"artist","locale":"pl"}')
  })

  it('sends the guest token and streams the reply events', async () => {
    const { fetch, calls } = fakeFetch(
      () =>
        new Response('event: text-delta\ndata: {"text":"Hi"}\n\n', {
          headers: { 'Content-Type': 'text/event-stream' },
        }),
    )
    const client = createSupportClient({ baseUrl: 'https://api.test', fetch })

    const events = []
    for await (const event of client.send('c1', 'Hello', 'secret')) events.push(event)

    expect(events).toEqual([{ type: 'text-delta', text: 'Hi' }])
    expect(new Headers(calls[0]?.init.headers).get('x-support-token')).toBe('secret')
  })

  it('turns an error status into SupportClientError with that status', async () => {
    const { fetch } = fakeFetch(() => new Response(null, { status: 409 }))
    const client = createSupportClient({ baseUrl: 'https://api.test', fetch })

    await expect(client.load('c1', 'secret')).rejects.toEqual(new SupportClientError(409))
  })
})
