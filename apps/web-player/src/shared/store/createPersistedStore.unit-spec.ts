import { describe, expect, it } from 'vitest'

import { createPersistedStore } from '@/shared/store/createPersistedStore'

type CounterState = {
  count: number
  increment: () => void
}

describe('createPersistedStore', () => {
  it('creates a usable Zustand store', () => {
    const useCounterStore = createPersistedStore<CounterState>({
      name: 'test-counter',
      initializer: (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
    })

    useCounterStore.getState().increment()

    expect(useCounterStore.getState().count).toBe(1)
  })
})
