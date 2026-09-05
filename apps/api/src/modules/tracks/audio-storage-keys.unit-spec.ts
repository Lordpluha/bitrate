import { describe, expect, it } from '@jest/globals'
import { getAudioGenerationRoot, getHlsRootFromAudioUrl } from './audio-storage-keys'

describe('audio storage keys', () => {
  it('creates a deterministic path-safe generation without exposing the source name', () => {
    const root = getAudioGenerationRoot('track-1', '../../private source.mp3')

    expect(root).toMatch(/^tracks\/track-1\/generations\/[a-f0-9]{16}$/)
    expect(root).not.toContain('private source')
  })

  it('resolves HLS beside a generation-scoped progressive file', () => {
    expect(
      getHlsRootFromAudioUrl(
        'track-1',
        'tracks/track-1/generations/0123456789abcdef/audio/192k.opus',
      ),
    ).toBe('tracks/track-1/generations/0123456789abcdef/hls')
  })

  it('preserves the legacy HLS location for existing TrackFile rows', () => {
    expect(getHlsRootFromAudioUrl('track-1', 'tracks/track-1/audio/192k.opus')).toBe(
      'tracks/track-1/hls',
    )
  })
})
