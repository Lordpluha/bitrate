import { create, type StateCreator } from 'zustand'
import { devtools, type PersistOptions, persist } from 'zustand/middleware'

export type CreatePersistedStoreInput<TState, TPersistedState = TState> = {
  name: string
  initializer: StateCreator<TState, [], []>
  persist?: PersistOptions<TState, TPersistedState>
}

/** Creates a Zustand store with consistent devtools and optional narrow persistence. */
export function createPersistedStore<TState, TPersistedState = TState>({
  name,
  initializer,
  persist: persistOptions,
}: CreatePersistedStoreInput<TState, TPersistedState>) {
  if (persistOptions) {
    return create<TState>()(
      devtools(persist(initializer, persistOptions), {
        enabled: process.env.NODE_ENV === 'development',
        name,
      }),
    )
  }

  return create<TState>()(
    devtools(initializer, {
      enabled: process.env.NODE_ENV === 'development',
      name,
    }),
  )
}
