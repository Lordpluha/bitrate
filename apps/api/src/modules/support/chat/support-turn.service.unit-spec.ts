import type { SupportEvent } from '@bitrate/support-core'
import { describe, expect, it } from '@jest/globals'
import {
  conversation,
  FakeBudget,
  FakeTurnStore,
  scriptedResponder,
} from './__tests__/support-turn.fakes'
import type { SupportResponder } from './support-responder'
import { SupportTurnService } from './support-turn.service'
import type { SupportTurnDeps } from './support-turn-deps'

async function collect(events: AsyncIterable<SupportEvent>) {
  const out: SupportEvent[] = []
  for await (const event of events) out.push(event)
  return out
}

const text = (events: SupportEvent[]) =>
  events.flatMap((event) => (event.type === 'text-delta' ? [event.text] : [])).join('')

function setup(overrides: Partial<SupportTurnDeps> = {}) {
  const store = new FakeTurnStore()
  const budget = new FakeBudget()
  const deps: SupportTurnDeps = {
    store,
    budget,
    responder: scriptedResponder([
      { type: 'text-delta', text: 'Email ' },
      { type: 'text-delta', text: 'us.' },
      { type: 'citation', citation: { chunkId: 'a#0', title: 'Delete', url: 'https://x' } },
      {
        type: 'done',
        outcome: 'answered',
        grounded: true,
        usage: { inputTokens: 900, outputTokens: 100 },
      },
    ]),
    handoffText: () => Promise.resolve('An operator will reply here.'),
    conversationTokenCap: 10_000,
    ...overrides,
  }
  return { service: new SupportTurnService(deps), store, budget }
}

describe('SupportTurnService', () => {
  it('stores the user message, streams the answer and saves it with its sources and usage', async () => {
    const { service, store, budget } = setup()

    const events = await collect(service.run(conversation(), 'How do I delete my account?'))

    expect(text(events)).toBe('Email us.')
    expect(store.log).toEqual(['user:How do I delete my account?', 'complete'])
    expect(store.completed[0]).toEqual({
      assistantText: 'Email us.',
      citations: [{ chunkId: 'a#0', title: 'Delete', url: 'https://x' }],
      state: 'bot',
      usage: { inputTokens: 900, outputTokens: 100 },
    })
    expect(budget.recorded).toEqual([{ inputTokens: 900, outputTokens: 100 }])
  })

  it('opens a ticket when the assistant hands the conversation to an operator (AC-3)', async () => {
    const { service, store } = setup({
      responder: scriptedResponder([
        { type: 'state', state: 'waiting_operator', reason: 'wants a refund' },
        { type: 'text-delta', text: 'Passing you to the team.' },
        {
          type: 'done',
          outcome: 'handed-off',
          grounded: false,
          usage: { inputTokens: 10, outputTokens: 5 },
        },
      ]),
    })

    await collect(service.run(conversation(), 'I want a person'))

    expect(store.completed[0]).toMatchObject({
      state: 'waiting_operator',
      ticketReason: 'wants a refund',
      assistantText: 'Passing you to the team.',
    })
  })

  it.each([
    ['the assistant is not configured', { responder: undefined }, 'assistant_unavailable'],
    ['the monthly budget is spent', { budget: new FakeBudget(false) }, 'budget_exhausted'],
  ])('hands off without calling a model when %s (AC-8)', async (_case, overrides, reason) => {
    const { service, store } = setup(overrides)

    const events = await collect(service.run(conversation(), 'Hello'))

    expect(events).toContainEqual({ type: 'state', state: 'waiting_operator', reason })
    expect(text(events)).toBe('An operator will reply here.')
    expect(store.completed[0]).toMatchObject({ state: 'waiting_operator', ticketReason: reason })
  })

  it('hands off when the conversation used up its token allowance', async () => {
    const { service, store } = setup()

    await collect(service.run(conversation({ inputTokens: 9_500, outputTokens: 600 }), 'One more'))

    expect(store.completed[0]).toMatchObject({ ticketReason: 'conversation_limit' })
  })

  it('hands off instead of leaving the user without an answer when the model fails', async () => {
    // A stream whose first read rejects, like a provider that fails before any output.
    const failing: SupportResponder = {
      respond: () => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.reject(new Error('provider overloaded')),
        }),
      }),
    }
    const { service, store } = setup({ responder: failing })

    const events = await collect(service.run(conversation(), 'Hello'))

    expect(events.at(-1)).toMatchObject({ type: 'done', outcome: 'handed-off' })
    expect(store.completed[0]).toMatchObject({
      ticketReason: 'assistant_failed',
      state: 'waiting_operator',
    })
  })

  it('only stores the message while an operator owns the conversation', async () => {
    const { service, store, budget } = setup()

    const events = await collect(service.run(conversation({ state: 'operator' }), 'Any news?'))

    expect(events).toEqual([
      {
        type: 'done',
        outcome: 'forwarded',
        grounded: false,
        usage: { inputTokens: 0, outputTokens: 0 },
      },
    ])
    expect(store.log).toEqual(['user:Any news?', 'touch'])
    expect(budget.recorded).toEqual([])
  })
})
