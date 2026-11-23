import { describe, expect, it } from 'vitest'
import { SupportAgent } from './agent.js'
import type { ConversationSnapshot, SupportEvent } from './domain.js'
import {
  FakeEmbedder,
  InMemoryKnowledgeIndex,
  type ScriptedStep,
  ScriptedChatModel,
  type StoredHit,
} from './testing/fakes.js'

const deleteAccountHit: StoredHit = {
  chunkId: 'listener/en/delete-account#0',
  title: 'Delete your listener account',
  url: 'https://bitrate.me/legal/privacy',
  text: 'Email tesluakevlad@gmail.com with the subject "Delete my account".',
  score: 0.82,
  audience: 'listener',
  locale: 'en',
}

const artistHit: StoredHit = {
  chunkId: 'artist/en/delete-account#0',
  title: 'Delete your artist account',
  text: 'Artists delete their account under Settings.',
  score: 0.9,
  audience: 'artist',
  locale: 'en',
}

const conversation = (overrides: Partial<ConversationSnapshot> = {}): ConversationSnapshot => ({
  audience: 'listener',
  locale: 'en',
  channel: 'web',
  state: 'bot',
  history: [],
  ...overrides,
})

async function collect(events: AsyncIterable<SupportEvent>): Promise<SupportEvent[]> {
  const out: SupportEvent[] = []
  for await (const event of events) out.push(event)
  return out
}

const textOf = (events: SupportEvent[]) =>
  events.flatMap((event) => (event.type === 'text-delta' ? [event.text] : [])).join('')

function setup(script: ScriptedStep[], hits: StoredHit[] = [deleteAccountHit, artistHit]) {
  const model = new ScriptedChatModel(script)
  const index = new InMemoryKnowledgeIndex(hits)
  const embedder = new FakeEmbedder()
  const agent = new SupportAgent({ chatModel: model, embedder, index })
  return { agent, model, index, embedder }
}

describe('SupportAgent', () => {
  it('searches the knowledge base first, then streams a cited answer', async () => {
    const { agent, model, index } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'delete account' } }] },
      { text: 'Email us with the subject "Delete my account".' },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation(), message: 'How do I delete my account?' }),
    )

    expect(model.calls[0]?.toolChoice).toBe('required')
    expect(textOf(events)).toBe('Email us with the subject "Delete my account".')
    expect(events).toContainEqual({
      type: 'citation',
      citation: {
        chunkId: deleteAccountHit.chunkId,
        title: deleteAccountHit.title,
        url: deleteAccountHit.url,
      },
    })
    expect(events.at(-1)).toEqual({
      type: 'done',
      outcome: 'answered',
      grounded: true,
      usage: { inputTokens: 20, outputTokens: 10 },
    })
    expect(index.queries[0]).toMatchObject({ audiences: ['listener', 'all'], locale: 'en' })
  })

  it('gives the model the retrieved article as data inside the tool result', async () => {
    const { agent, model } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'delete account' } }] },
      { text: 'Answer.' },
    ])

    await collect(agent.respond({ conversation: conversation(), message: 'delete?' }))

    const toolMessage = model.calls[1]?.messages.find((message) => message.role === 'tool')
    expect(toolMessage?.content).toContain(deleteAccountHit.text)
    expect(toolMessage?.content).toContain('<article')
  })

  it('never shows one audience the other audience’s articles', async () => {
    const { agent } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'delete account' } }] },
      { text: 'Answer.' },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation(), message: 'delete my account' }),
    )

    const cited = events.flatMap((event) =>
      event.type === 'citation' ? [event.citation.chunkId] : [],
    )
    expect(cited).not.toContain(artistHit.chunkId)
  })

  it('tells the model when nothing relevant was found, and cites nothing (AC-2)', async () => {
    const weak: StoredHit = { ...deleteAccountHit, score: 0.1 }
    const { agent, model } = setup(
      [
        { toolCalls: [{ name: 'search_knowledge', input: { query: 'concert tickets' } }] },
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
    const { agent, index } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'usunąć konto' } }] },
      { text: 'Odpowiedź.' },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation({ locale: 'pl' }), message: 'Jak usunąć konto?' }),
    )

    expect(index.queries.map((query) => query.locale)).toEqual(['pl', undefined])
    expect(events.some((event) => event.type === 'citation')).toBe(true)
  })

  it('hands off to an operator with a fixed message in the user’s language (AC-3)', async () => {
    const { agent, model } = setup([
      {
        toolCalls: [{ name: 'handoff_to_operator', input: { reason: 'user asked for a person' } }],
      },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation({ locale: 'uk' }), message: 'Хочу людину' }),
    )

    expect(events).toContainEqual({
      type: 'state',
      state: 'waiting_operator',
      reason: 'user asked for a person',
    })
    expect(textOf(events)).toMatch(/оператор/i)
    expect(events.at(-1)).toMatchObject({ type: 'done', outcome: 'handed-off' })
    expect(model.calls).toHaveLength(1)
  })

  it('does not call the model while a person owns the conversation', async () => {
    const { agent, model } = setup([])

    for (const state of ['waiting_operator', 'operator'] as const) {
      const events = await collect(
        agent.respond({ conversation: conversation({ state }), message: 'Any news?' }),
      )
      expect(events).toEqual([
        {
          type: 'done',
          outcome: 'forwarded',
          grounded: false,
          usage: { inputTokens: 0, outputTokens: 0 },
        },
      ])
    }
    expect(model.calls).toHaveLength(0)
  })

  it('returns a resolved conversation to the bot', async () => {
    const { agent } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'x' } }] },
      { text: 'Answer.' },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation({ state: 'resolved' }), message: 'Hi again' }),
    )

    expect(events[0]).toEqual({ type: 'state', state: 'bot' })
  })

  it('forbids tools on the last step so every turn ends in text', async () => {
    const search = { toolCalls: [{ name: 'search_knowledge', input: { query: 'x' } }] }
    const { agent, model } = setup([search, search, search, { text: 'Final.' }])

    const events = await collect(agent.respond({ conversation: conversation(), message: 'x' }))

    expect(model.calls.map((call) => call.toolChoice)).toEqual(['required', 'auto', 'auto', 'none'])
    expect(textOf(events)).toBe('Final.')
  })

  it('sends a localized fallback when the model returns no text', async () => {
    const { agent } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'x' } }] },
      { text: '' },
    ])

    const events = await collect(
      agent.respond({ conversation: conversation({ locale: 'pl' }), message: 'x' }),
    )

    expect(textOf(events)).toMatch(/człowiek/i)
    expect(events.at(-1)).toMatchObject({ type: 'done', outcome: 'fallback' })
  })

  it('reports invalid tool input back to the model instead of failing', async () => {
    const { agent, model } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { q: 42 } }] },
      { text: 'Answer.' },
    ])

    await collect(agent.respond({ conversation: conversation(), message: 'x' }))

    const toolMessage = model.calls[1]?.messages.find((message) => message.role === 'tool')
    expect(toolMessage?.content).toContain('INVALID_INPUT')
  })

  it('builds a system prompt for the audience and language, and passes history', async () => {
    const { agent, model } = setup([
      { toolCalls: [{ name: 'search_knowledge', input: { query: 'x' } }] },
      { text: 'Answer.' },
    ])

    await collect(
      agent.respond({
        conversation: conversation({
          audience: 'artist',
          locale: 'uk',
          history: [
            { role: 'user', text: 'Hello' },
            { role: 'operator', text: 'Hi, this is the team.' },
          ],
        }),
        message: 'x',
      }),
    )

    const first = model.calls[0]
    expect(first?.system).toMatch(/artist/i)
    expect(first?.system).toMatch(/Ukrainian/)
    expect(first?.messages.slice(0, 3)).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi, this is the team.' },
      { role: 'user', content: 'x' },
    ])
  })
})
