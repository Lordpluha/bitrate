import { describe, expect, it } from '@jest/globals'
import { formatEvent } from './format-event'

describe('formatEvent', () => {
  it('names the frame after the event and sends the rest as JSON', () => {
    expect(formatEvent({ type: 'text-delta', text: 'Hi\nthere' })).toBe(
      'event: text-delta\ndata: {"text":"Hi\\nthere"}\n\n',
    )
  })

  it('keeps token usage out of the client stream', () => {
    const frame = formatEvent({
      type: 'done',
      outcome: 'answered',
      grounded: true,
      usage: { inputTokens: 900, outputTokens: 100 },
    })

    expect(frame).toBe('event: done\ndata: {"outcome":"answered","grounded":true}\n\n')
  })
})
