import { describe, expect, it } from 'vitest'
import {
  collect,
  conversation,
  deleteAccountHit,
  searchStep,
  setupAgent,
  textOf,
} from '../testing/agent-harness.js'

describe('SupportAgent turn', () => {
  it('searches the knowledge base first, then streams a cited answer', async () => {
    const { agent, model } = setupAgent([
      searchStep('delete account'),
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
  })

  it('hands off to an operator with a fixed message in the user’s language (AC-3)', async () => {
    const { agent, model } = setupAgent([
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
    const { agent, model } = setupAgent([])

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
    const { agent } = setupAgent([searchStep('x'), { text: 'Answer.' }])

    const events = await collect(
      agent.respond({ conversation: conversation({ state: 'resolved' }), message: 'Hi again' }),
    )

    expect(events[0]).toEqual({ type: 'state', state: 'bot' })
  })

  it('forbids tools on the last step so every turn ends in text', async () => {
    const { agent, model } = setupAgent([
      searchStep('x'),
      searchStep('x'),
      searchStep('x'),
      { text: 'Final.' },
    ])

    const events = await collect(agent.respond({ conversation: conversation(), message: 'x' }))

    expect(model.calls.map((call) => call.toolChoice)).toEqual(['required', 'auto', 'auto', 'none'])
    expect(textOf(events)).toBe('Final.')
  })

  it('sends a localized fallback when the model returns no text', async () => {
    const { agent } = setupAgent([searchStep('x'), { text: '' }])

    const events = await collect(
      agent.respond({ conversation: conversation({ locale: 'pl' }), message: 'x' }),
    )

    expect(textOf(events)).toMatch(/człowiek/i)
    expect(events.at(-1)).toMatchObject({ type: 'done', outcome: 'fallback' })
  })

  it('builds a system prompt for the audience and language, and passes history', async () => {
    const { agent, model } = setupAgent([searchStep('x'), { text: 'Answer.' }])

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
