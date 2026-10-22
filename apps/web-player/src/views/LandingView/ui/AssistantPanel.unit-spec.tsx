import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { en } from '../model/messages/en'
import { AssistantPanel } from './AssistantPanel'

/** The answer starts after the search and composing phases (just past them). */
const ANSWER_DUE_MS = 1651

const askFirstPreset = () => {
  render(<AssistantPanel />)
  fireEvent.click(screen.getByRole('button', { name: en['assistant.q1'] }))
}

describe('landing assistant', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('streams the prepared answer word by word until it is complete', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    askFirstPreset()
    act(() => {
      vi.advanceTimersByTime(ANSWER_DUE_MS)
    })
    const words = en['assistant.a_what'].split(' ')
    expect(screen.getByText(words[0] ?? '', { exact: true })).toBeVisible()
    act(() => {
      vi.advanceTimersByTime(45 * words.length)
    })
    expect(screen.getByText(en['assistant.a_what'])).toBeVisible()
  })

  it('shows the whole answer at once with reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    askFirstPreset()
    act(() => {
      vi.advanceTimersByTime(ANSWER_DUE_MS)
    })
    expect(screen.getByText(en['assistant.a_what'])).toBeVisible()
  })
})
