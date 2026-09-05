---
name: zustand
description: Zustand store conventions for web-player — createPersistedStore, where a store lives in the FSD tree, selector discipline, partialize for persistence, and the auth reset registry. Use when adding or changing a Zustand store, a store selector, persisted client state, or when a component re-renders on unrelated store changes.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Zustand — cross-component client state

Zustand holds **client** state only. Server data stays in React Query; duplicating an API
response into a store is the mistake this split exists to prevent.

## Where a store lives

One concrete store per owning slice, in its `model/` segment:

```
apps/web-player/src/entities/Player/model/playerStore.ts   → usePlayerStore
apps/web-player/src/shared/store/createPersistedStore.ts   → the factory
apps/web-player/src/shared/store/resetStores.ts            → the auth reset registry
```

`shared/store/` holds **generic factories and registries only** — never a concrete domain
store. A store for player state belongs to the Player entity, and consumers reach it through
`@/entities/Player`'s barrel, not a deep path.

## Creating a store

```ts
import { createPersistedStore } from '@/shared/store'

type PlayerState = {
  currentTrackId: string | null
  isPlaying: boolean
  play: (id: string) => void
  pause: () => void
}

export const usePlayerStore = createPersistedStore<PlayerState>({
  name: 'player',
  initializer: (set) => ({
    currentTrackId: null,
    isPlaying: false,
    play: (id) => set({ currentTrackId: id, isPlaying: true }),
    pause: () => set({ isPlaying: false }),
  }),
})
```

`createPersistedStore` is the canonical factory — it wires `devtools` and persistence
consistently. Do not hand-roll `create()(devtools(persist(...)))` in a slice; a store that
skips the factory is invisible in Redux DevTools and outside the reset registry.

## Selectors are not optional

```ts
/** ✗ Don't — re-renders on every state change, including unrelated ones */
const store = usePlayerStore()

/** ✓ Do — re-renders only when isPlaying changes */
const isPlaying = usePlayerStore((s) => s.isPlaying)
```

Subscribing to the whole store is the single most common Zustand performance bug. Select the
narrowest slice each component actually needs.

**Selecting an object or array creates a new reference every render** and defeats the
comparison:

```ts
/** ✗ new object each time → always re-renders */
const { isPlaying, currentTrackId } = usePlayerStore((s) => ({ ... }))

/** ✓ two atomic selectors */
const isPlaying = usePlayerStore((s) => s.isPlaying)
const currentTrackId = usePlayerStore((s) => s.currentTrackId)

/** ✓ or one selector with an equality fn, when they genuinely change together */
const pair = usePlayerStore(useShallow((s) => [s.isPlaying, s.currentTrackId]))
```

Actions are stable references — selecting `(s) => s.play` never causes a re-render, so
passing an action down as a prop is free.

## Persistence — narrow by default

Persisting the whole store is how stale or sensitive state survives a logout.

```ts
partialize: (s) => ({ volume: s.volume, repeatMode: s.repeatMode })
```

Persist **preferences**, not session data, not server data, not anything derived. Every
persisted store defines `partialize` explicitly.

Persisted state is rehydrated from `localStorage` *after* the first render, which in Next.js
means the server render and the first client render disagree. That is a hydration mismatch.
Read persisted values behind a mounted check, or render the persisted-dependent part only on
the client.

## Auth-bound state must reset

Any store holding data tied to the logged-in user exposes `reset()` and registers it:

```ts
registerStoreReset(() => usePlayerStore.getState().reset())
```

`resetStores.ts` clears them on logout. A store that skips this leaks one user's state into
the next session on a shared device — the kind of bug that is invisible in development.

## Outside React

`usePlayerStore.getState()` reads and `.setState()` writes without a hook — correct in an
event handler, a middleware, or an audio-element callback. **Not** correct in a component
body: it does not subscribe, so the component will not re-render when the value changes.

## Gotchas

- **`set` merges shallowly** at the top level only. Updating a nested object replaces it —
  spread it yourself.
- **Do not put server data here.** If it came from an API, React Query owns it. The
  exception is an explicit cross-route draft the user is editing.
- **Do not store derived values.** Compute during render; a derived value in state is a
  second source of truth that will drift.
- **`devtools` names matter** — the `name` given to the factory is what appears in Redux
  DevTools; a store called `store` is unusable there.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/zustand` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('zustand/package.json').version"
   ```
2. **Then the official docs:** https://zustand.docs.pmnd.rs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because v5 changed the default selector equality behaviour that v4 examples rely on.

## Related

- `.claude/rules/react.md` § "State management" — the Zustand store contract.
- `.claude/rules/web-player-rules.md` — the client/server state split.
- `react-query` skill — the server-state half.
- ADR-0005 — why Zustand, and the persistence/migration contract.
