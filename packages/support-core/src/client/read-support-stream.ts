import type { ClientSupportEvent } from './support-client-event.js'
import { toClientEvent } from './to-client-event.js'

/**
 * Reads the support reply stream (`text/event-stream`) from a `fetch` body. Frames may arrive
 * split across chunks; frames that do not parse are skipped, not fatal.
 */
export async function* readSupportStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ClientSupportEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    // `stream: true` keeps a multi-byte character split across chunks intact.
    if (value) buffer += decoder.decode(value, { stream: true })
    let end = buffer.indexOf('\n\n')
    while (end >= 0) {
      const event = parseFrame(buffer.slice(0, end))
      if (event) yield event
      buffer = buffer.slice(end + 2)
      end = buffer.indexOf('\n\n')
    }
    if (done) return
  }
}

function parseFrame(frame: string): ClientSupportEvent | undefined {
  let type = 'message'
  let data = ''
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) type = line.slice(6).trim()
    else if (line.startsWith('data:')) data += line.slice(5).trim()
  }
  try {
    return toClientEvent(type, JSON.parse(data))
  } catch {
    return undefined
  }
}
