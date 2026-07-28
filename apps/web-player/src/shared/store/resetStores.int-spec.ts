import { describe, expect, it } from 'vitest'

import {
  createPersistedStore,
  registerStoreReset,
  resetAllStores,
} from '@/shared/store'

type SessionBoundState = {
  value: string | null
  setValue: (value: string) => void
  reset: () => void
}

describe('store reset integration', () => {
  it('clears registered Zustand state through the shared registry', () => {
    const useSessionBoundStore = createPersistedStore<SessionBoundState>({
      name: 'session-bound-test',
      initializer: (set) => ({
        value: null,
        setValue: (value) => set({ value }),
        reset: () => set({ value: null }),
      }),
    })
    const unregister = registerStoreReset({
      reset: () => useSessionBoundStore.getState().reset(),
    })

    useSessionBoundStore.getState().setValue('owned-by-session')
    resetAllStores()

    expect(useSessionBoundStore.getState().value).toBeNull()

    unregister()
  })
})
