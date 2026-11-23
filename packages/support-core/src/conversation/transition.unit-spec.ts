import { describe, expect, it } from 'vitest'
import { InvalidTransitionError } from './invalid-transition-error.js'
import { transition } from './transition.js'

describe('conversation state machine', () => {
  it('hands a bot conversation to an operator', () => {
    expect(transition('bot', 'handoff')).toBe('waiting_operator')
  })

  it('moves to operator on the first operator reply and stays there', () => {
    expect(transition('waiting_operator', 'operator-reply')).toBe('operator')
    expect(transition('operator', 'operator-reply')).toBe('operator')
  })

  it('keeps a person in charge while the user writes', () => {
    expect(transition('waiting_operator', 'user-message')).toBe('waiting_operator')
    expect(transition('operator', 'user-message')).toBe('operator')
  })

  it('resolves a handed-off conversation and returns it to the bot on the next message', () => {
    expect(transition('operator', 'resolve')).toBe('resolved')
    expect(transition('waiting_operator', 'resolve')).toBe('resolved')
    expect(transition('resolved', 'user-message')).toBe('bot')
  })

  it('rejects transitions that make no sense', () => {
    expect(() => transition('bot', 'operator-reply')).toThrow(InvalidTransitionError)
    expect(() => transition('resolved', 'handoff')).toThrow(InvalidTransitionError)
    expect(() => transition('bot', 'resolve')).toThrow(InvalidTransitionError)
  })
})
