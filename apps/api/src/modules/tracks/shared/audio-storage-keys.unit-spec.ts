import { describe, expect, it } from '@jest/globals'
import { getAudioGenerationRoot } from './audio-storage-keys'

describe('audio storage keys', () => {
  it('creates a deterministic path-safe generation without exposing the source name', () => {
    const root = getAudioGenerationRoot('track-1', '../../private source.mp3')

    expect(root).toMatch(/^tracks\/track-1\/generations\/[a-f0-9]{16}$/)
    expect(root).not.toContain('private source')
  })
})
