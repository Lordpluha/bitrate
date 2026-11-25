import { describe, expect, it } from 'vitest'
import { readSupportStream } from './read-support-stream.js'
import type { ClientSupportEvent } from './support-client-event.js'

function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const out: ClientSupportEvent[] = []
  for await (const event of readSupportStream(stream)) out.push(event)
  return out
}

describe('readSupportStream', () => {
  it('parses named Server-Sent Events, even when a frame is split across chunks', async () => {
    const events = await collect(
      streamOf(
        'event: text-delta\ndata: {"text":"Hel',
        'lo"}\n\nevent: citation\ndata: {"citation":{"chunkId":"a#0","title":"Delete"}}\n\n',
        'event: done\ndata: {"outcome":"answered","grounded":true}\n\n',
      ),
    )

    expect(events).toEqual([
      { type: 'text-delta', text: 'Hello' },
      { type: 'citation', citation: { chunkId: 'a#0', title: 'Delete' } },
      { type: 'done', outcome: 'answered', grounded: true },
    ])
  })

  it('skips frames it does not understand instead of failing the answer', async () => {
    const events = await collect(
      streamOf(
        'event: ping\ndata: {}\n\n',
        'event: text-delta\ndata: not json\n\n',
        'event: state\ndata: {"state":"waiting_operator","reason":"budget_exhausted"}\n\n',
      ),
    )

    expect(events).toEqual([
      { type: 'state', state: 'waiting_operator', reason: 'budget_exhausted' },
    ])
  })

  it('reports a server-side stream failure as an error event', async () => {
    const events = await collect(streamOf('event: error\ndata: {"code":"stream_failed"}\n\n'))

    expect(events).toEqual([{ type: 'error', code: 'stream_failed' }])
  })
})
