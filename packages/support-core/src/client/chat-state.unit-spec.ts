import { describe, expect, it } from 'vitest'
import { applySupportEvent } from './apply-support-event.js'
import { EMPTY_CHAT_STATE } from './chat-state.js'
import { chatStateFromView } from './chat-state-from-view.js'
import { failSupportTurn } from './fail-support-turn.js'
import { startSupportTurn } from './start-support-turn.js'

describe('support chat state', () => {
  it('shows the user message at once and streams the reply into one assistant bubble', () => {
    let state = startSupportTurn(EMPTY_CHAT_STATE, 'How do I delete my account?')
    state = applySupportEvent(state, { type: 'text-delta', text: 'Email ' })
    state = applySupportEvent(state, { type: 'text-delta', text: 'us.' })
    state = applySupportEvent(state, {
      type: 'citation',
      citation: { chunkId: 'a#0', title: 'Privacy Policy', url: 'https://x' },
    })
    state = applySupportEvent(state, { type: 'done', outcome: 'answered', grounded: true })

    expect(state.status).toBe('idle')
    expect(state.messages.map(({ role, text }) => ({ role, text }))).toEqual([
      { role: 'user', text: 'How do I delete my account?' },
      { role: 'assistant', text: 'Email us.' },
    ])
    expect(state.messages[1]?.sources).toEqual([{ title: 'Privacy Policy', url: 'https://x' }])
  })

  it('waits for an operator after a handoff, and drops an unused reply bubble', () => {
    let state = startSupportTurn(EMPTY_CHAT_STATE, 'Any news?')
    state = applySupportEvent(state, { type: 'done', outcome: 'forwarded', grounded: false })

    expect(state.status).toBe('waiting_operator')
    expect(state.messages).toHaveLength(1)
  })

  it.each([
    [429, 'limited'],
    [500, 'error'],
    [undefined, 'offline'],
  ] as const)('maps a failed request (%s) to the %s status', (status, expected) => {
    const state = failSupportTurn(startSupportTurn(EMPTY_CHAT_STATE, 'Hi'), status)

    expect(state.status).toBe(expected)
    expect(state.messages.map((message) => message.role)).toEqual(['user'])
  })

  it('restores a saved conversation, including the waiting state', () => {
    const state = chatStateFromView({
      id: 'c1',
      state: 'waiting_operator',
      messages: [{ id: 'm1', role: 'operator', text: 'Hi', citations: [] }],
    })

    expect(state).toEqual({
      status: 'waiting_operator',
      messages: [{ id: 'm1', role: 'operator', text: 'Hi', sources: [] }],
    })
  })
})
