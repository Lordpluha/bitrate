type Listener = () => void

const listeners = new Set<Listener>()

/**
 * A tiny bus for "the session is gone": the API client emits it, the session layer listens.
 * Keeps `lib/api` free of any dependency on React Query or navigation.
 */
export const sessionEvents = {
  onExpired(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  emitExpired() {
    for (const listener of listeners) listener()
  },
}
