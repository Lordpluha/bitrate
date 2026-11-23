import { describe, expect, it } from 'vitest'
import { CHANNEL_MESSAGE_LIMITS } from './limits.js'
import { renderForChannel } from './render-for-channel.js'

const answer = {
  text: '## Delete\n\nEmail **us** at [support](https://bitrate.me/help) with `Delete my account`.\n\n- Step <one> & two',
  citations: [
    { chunkId: 'a#0', title: 'Delete your account', url: 'https://bitrate.me/legal/privacy' },
    { chunkId: 'b#0', title: 'Talk to a person' },
  ],
}

describe('renderForChannel', () => {
  it('leaves web Markdown untouched; the widget renders citations itself', () => {
    expect(renderForChannel(answer, 'web', 'en')).toEqual([answer.text])
  })

  it('renders Telegram HTML with escaping and a localized source list', () => {
    const [part] = renderForChannel(answer, 'telegram', 'uk')

    expect(part).toContain('<b>Delete</b>')
    expect(part).toContain('<b>us</b>')
    expect(part).toContain('<a href="https://bitrate.me/help">support</a>')
    expect(part).toContain('<code>Delete my account</code>')
    expect(part).toContain('• Step &lt;one&gt; &amp; two')
    expect(part).toContain('<b>Джерела</b>')
    expect(part).toContain('• <a href="https://bitrate.me/legal/privacy">Delete your account</a>')
    expect(part).toContain('• Talk to a person')
  })

  it('renders WhatsApp formatting with links spelled out', () => {
    const [part] = renderForChannel(answer, 'whatsapp', 'pl')

    expect(part).toContain('*Delete*')
    expect(part).toContain('*us*')
    expect(part).toContain('support (https://bitrate.me/help)')
    expect(part).toContain('*Źródła*')
    expect(part).toContain('• Delete your account (https://bitrate.me/legal/privacy)')
  })

  it('renders plain text for Instagram', () => {
    const [part] = renderForChannel(answer, 'instagram', 'en')

    expect(part).not.toMatch(/[*`#]/)
    expect(part).toContain('Email us at support (https://bitrate.me/help)')
    expect(part).toContain('Sources:')
  })

  it('splits long answers at paragraph boundaries within the channel limit', () => {
    const paragraph = 'a'.repeat(400)
    const long = { text: Array.from({ length: 5 }, () => paragraph).join('\n\n'), citations: [] }

    const parts = renderForChannel(long, 'instagram', 'en')

    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(CHANNEL_MESSAGE_LIMITS.instagram)
      expect(part).toMatch(/^a+(\n\na+)*$/)
    }
  })

  it('hard-splits a single paragraph that exceeds the limit', () => {
    const parts = renderForChannel(
      { text: 'word '.repeat(400).trim(), citations: [] },
      'instagram',
      'en',
    )

    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts)
      expect(part.length).toBeLessThanOrEqual(CHANNEL_MESSAGE_LIMITS.instagram)
  })
})
