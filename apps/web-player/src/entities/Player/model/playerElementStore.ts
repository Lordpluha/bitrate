import type { BitratePlayerElement } from '@bitrate/player/contract'
import { createPersistedStore } from '@/shared/store'

type PlayerElementState = {
  /** The one `<bitrate-player>` that plays; every visible surface mirrors it. */
  element: BitratePlayerElement | null
  setElement: (element: BitratePlayerElement | null) => void
}

/**
 * Where the playing element is shared from: the player bar, the mobile island and the
 * now-playing view live in different widgets but mirror the same element.
 */
export const usePlayerElementStore = createPersistedStore<PlayerElementState>({
  name: 'player-element',
  initializer: (set) => ({
    element: null,
    setElement: (element) => set({ element }),
  }),
})
