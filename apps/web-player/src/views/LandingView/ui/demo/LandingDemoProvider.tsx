'use client'

import { usePlayerStore } from '@entities/Player'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { type ReactNode, useEffect, useState } from 'react'
import { DEMO_TRACK_LIST } from '../../model/demo/demoData'
import { createDemoQueryClient } from '../../model/demo/demoQueryClient'
import {
  DEMO_EFFECTS,
  DEMO_SEEDS,
  resolveDemoQuery,
} from '../../model/demo/demoSeeds'

/** A router that stays put: a real block's `router.push` or `back` never leaves the landing. */
const STAY_ON_LANDING: AppRouterInstance = {
  back: () => undefined,
  bfcacheId: 'landing-demo',
  forward: () => undefined,
  prefetch: () => undefined,
  push: () => undefined,
  refresh: () => undefined,
  replace: () => undefined,
}

/** The demo listener's player: Night Drive loaded and paused on its first track. */
const DEMO_PLAYBACK = {
  currentPlaylistId: 'demo-p1',
  currentPlaylistName: 'Night Drive',
  currentTrack: DEMO_TRACK_LIST[0] ?? null,
  currentTrackIndex: 0,
  currentTime: 98,
  duration: DEMO_TRACK_LIST[0]?.duration ?? 0,
  isPlaying: false,
  playlist: [...DEMO_TRACK_LIST],
  progress: 42,
}

type LandingDemoProviderProps = {
  children: ReactNode
}

/**
 * Lets the landing render the web player's real blocks for a guest: an offline QueryClient
 * seeded with the demo library (no request ever leaves), a router that never navigates, and
 * a demo track in the player store. There is no playing element on the landing, so Play only
 * flips the store; the visitor's own player state comes back when the landing unmounts.
 */
export const LandingDemoProvider = ({ children }: LandingDemoProviderProps) => {
  const [client] = useState(() =>
    createDemoQueryClient({
      effects: DEMO_EFFECTS,
      resolve: resolveDemoQuery,
      seeds: DEMO_SEEDS,
    }),
  )

  useEffect(() => {
    const before = usePlayerStore.getState()
    usePlayerStore.setState(DEMO_PLAYBACK)
    return () => {
      usePlayerStore.setState(before, true)
    }
  }, [])

  return (
    <AppRouterContext.Provider value={STAY_ON_LANDING}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AppRouterContext.Provider>
  )
}
