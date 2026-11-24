import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupportChatState } from './chat-state.js'
import type { SupportConversationView } from './to-conversation-view.js'
import { watchOperatorReplies } from './watch-operator-replies.js'

const view = (state: SupportConversationView['state']): SupportConversationView => ({
  id: 'c-1',
  state,
  messages: [{ id: 'm-1', role: 'operator', text: 'We are on it', citations: [] }],
})

describe('watchOperatorReplies', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reloads the conversation on every tick and hands over the new chat state', async () => {
    const load = vi.fn(async () => view('operator'))
    const states: SupportChatState[] = []
    const stop = watchOperatorReplies({ load, onState: (s) => states.push(s), intervalMs: 1000 })

    await vi.advanceTimersByTimeAsync(2000)
    stop()

    expect(load).toHaveBeenCalledTimes(2)
    expect(states[0]).toEqual({
      status: 'waiting_operator',
      messages: [{ id: 'm-1', role: 'operator', text: 'We are on it', sources: [] }],
    })
  })

  it('reports a resolved conversation as idle, so the caller can stop watching', async () => {
    const onState = vi.fn()
    const stop = watchOperatorReplies({
      load: async () => view('resolved'),
      onState,
      intervalMs: 1000,
    })

    await vi.advanceTimersByTimeAsync(1000)
    stop()

    expect(onState).toHaveBeenCalledWith(expect.objectContaining({ status: 'idle' }))
  })

  it('skips ticks while the page is hidden', async () => {
    const load = vi.fn(async () => view('operator'))
    const stop = watchOperatorReplies({
      load,
      onState: vi.fn(),
      intervalMs: 1000,
      isHidden: () => true,
    })

    await vi.advanceTimersByTimeAsync(3000)
    stop()

    expect(load).not.toHaveBeenCalled()
  })

  it('keeps watching after a failed load', async () => {
    const load = vi
      .fn<() => Promise<SupportConversationView>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(view('operator'))
    const onState = vi.fn()
    const stop = watchOperatorReplies({ load, onState, intervalMs: 1000 })

    await vi.advanceTimersByTimeAsync(2000)
    stop()

    expect(onState).toHaveBeenCalledTimes(1)
  })

  it('drops a load that finishes after stop', async () => {
    let finish: (value: SupportConversationView) => void = () => {}
    const load = vi.fn(
      () =>
        new Promise<SupportConversationView>((resolve) => {
          finish = resolve
        }),
    )
    const onState = vi.fn()
    const stop = watchOperatorReplies({ load, onState, intervalMs: 1000 })

    await vi.advanceTimersByTimeAsync(1000)
    stop()
    finish(view('operator'))
    await vi.advanceTimersByTimeAsync(0)

    expect(onState).not.toHaveBeenCalled()
  })
})
