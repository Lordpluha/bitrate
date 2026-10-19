import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MeSettings } from '@/entities/Me'
import { useSettingsStore } from '@/entities/Settings'
import { useAccountSettingsSync } from './useAccountSettingsSync'

const accountSettings: MeSettings = {
  autoplay: true,
  compactLibrary: true,
  explicitContent: true,
  followersVisible: true,
  language: 'uk',
  normalizeVolume: false,
  privateSession: false,
  publicPlaylistsOnProfile: true,
  showListeningActivity: true,
  showNowPlaying: false,
  streamingQuality: 'very-high',
}

vi.mock('@/shared/hooks', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))
vi.mock('@/entities/Me', () => ({
  useMeSettings: () => ({ data: accountSettings }),
}))

describe('useAccountSettingsSync', () => {
  beforeEach(() => {
    useSettingsStore.setState({ hasHydrated: false })
    useSettingsStore.getState().reset()
  })

  it('applies the account preferences once the local copy has loaded', () => {
    renderHook(() => useAccountSettingsSync())
    expect(useSettingsStore.getState().language).toBe('en')

    act(() => {
      useSettingsStore.getState().hydrate({})
    })

    expect(useSettingsStore.getState()).toMatchObject({
      compactLibrary: true,
      language: 'uk',
      nowPlayingPanel: false,
      streamingQuality: 'High',
    })
  })
})
