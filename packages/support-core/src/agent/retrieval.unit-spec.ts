import { describe, expect, it } from 'vitest'
import {
  artistHit,
  collect,
  conversation,
  deleteAccountHit,
  searchStep,
  setupAgent,
} from '../testing/agent-harness.js'
import type { StoredHit } from '../testing/in-memory-knowledge-index.js'

describe('SupportAgent knowledge retrieval', () => {
  it('gives the model the retrieved article as data inside the tool result', async () => {
    const { agent, model } = setupAgent([searchStep('delete account'), { text: 'Answer.' }])

    await collect(agent.respond({ conversation: conversation(), message: 'delete?' }))

    const toolMessage = model.calls[1]?.messages.find((message) => message.role === 'tool')
    expect(toolMessage?.content).toContain(deleteAccountHit.text)
    expect(toolMessage?.content).toContain('<article')
  })

  it('never shows one audience the other audience’s articles', async () => {
    const { agent, index } = setupAgent([searchStep('delete account'), { text: 'Answer.' }])

    const events = await collect(
      agent.respond({ conversation: conversation(), message: 'delete my account' }),
    )

    const cited = events.flatMap((event) =>
      event.type === 'citation' ? [event.citation.chunkId] : [],
    )
    expect(cited).not.toContain(artistHit.chunkId)
    expect(index.queries[0]).toMatchObject({ audiences: ['listener', 'all'], locale: 'en' })
  })

  it('tells the model when nothing relevant was found, and cites nothing (AC-2)', async () => {
    const weak: StoredHit = { ...deleteAccountHit, score: 0.1 }
    const { agent, model } = setupAgent(
      [
        searchStep('concert tickets'),
        { text: 'I could not find that. Would you like to talk to a person?' },
      ],
      [weak],
    )

    const events = await collect(
      agent.respond({ conversation: conversation(), message: 'Where do I buy concert tickets?' }),
    )

    const toolMessage = model.calls[1]?.messages.find((message) => message.role === 'tool')
    expect(toolMessage?.content).toContain('NO_RELEVANT_ARTICLES')
    expect(events.some((event) => event.type === 'citation')).toBe(false)
    expect(events.at(-1)).toMatchObject({ type: 'done', outcome: 'answered', grounded: false })
  })

  it('falls back to every locale when the user’s locale has no relevant article', async () => {
    const { agent, index } = setupAgent([searchStep('usunąć konto'), { text: 'Odpowiedź.' }])

    const events = await collect(
      agent.respond({ conversation: conversation({ locale: 'pl' }), message: 'Jak usunąć konto?' }),
    )

    expect(index.queries.map((query) => query.locale)).toEqual(['pl', undefined])
    expect(events.some((event) => event.type === 'citation')).toBe(true)
  })

  it('reports invalid tool input back to the model instead of failing', async () => {
    const { agent, model } = setupAgent([
      { toolCalls: [{ name: 'search_knowledge', input: { q: 42 } }] },
      { text: 'Answer.' },
    ])

    await collect(agent.respond({ conversation: conversation(), message: 'x' }))

    const toolMessage = model.calls[1]?.messages.find((message) => message.role === 'tool')
    expect(toolMessage?.content).toContain('INVALID_INPUT')
  })
})
