import { beforeEach, describe, expect, it } from 'vitest'

import { initialSettings, useSettingsStore } from './settingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset()
  })

  it('starts from the documented defaults', () => {
    expect(useSettingsStore.getState()).toMatchObject(initialSettings)
  })

  it('sets a non-boolean setting', () => {
    useSettingsStore.getState().setSetting('streamingQuality', 'High')

    expect(useSettingsStore.getState().streamingQuality).toBe('High')
  })

  it('toggles a boolean setting', () => {
    expect(useSettingsStore.getState().compactLibrary).toBe(false)

    useSettingsStore.getState().toggleSetting('compactLibrary')

    expect(useSettingsStore.getState().compactLibrary).toBe(true)
  })

  it('marks itself hydrated and applies a stored snapshot', () => {
    useSettingsStore.getState().hydrate({ compactLibrary: true })

    expect(useSettingsStore.getState().compactLibrary).toBe(true)
    expect(useSettingsStore.getState().hasHydrated).toBe(true)
  })

  it('keeps untouched keys when hydrating a partial snapshot', () => {
    useSettingsStore.getState().hydrate({ compactLibrary: true })

    expect(useSettingsStore.getState().language).toBe(initialSettings.language)
  })

  it('restores defaults on reset', () => {
    useSettingsStore.getState().setSetting('normalizeVolume', true)

    useSettingsStore.getState().reset()

    expect(useSettingsStore.getState().normalizeVolume).toBe(false)
  })
})
