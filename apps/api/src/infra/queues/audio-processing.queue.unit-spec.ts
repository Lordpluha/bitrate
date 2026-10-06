import { describe, expect, it } from '@jest/globals'
import { parseConvertAudioJob } from './audio-processing.queue'

const valid = {
  trackId: 'track-1',
  artistId: 'artist-1',
  sourceFileName: 'source.mp3',
  masterKey: 'masters/source.mp3',
  format: 'opus',
  bitrates: ['128k', '192k'],
}

describe('parseConvertAudioJob', () => {
  it('accepts a key-based payload, with optional trigger and input probe', () => {
    const result = parseConvertAudioJob({
      ...valid,
      trigger: 'REPROCESS',
      input: { bytes: 10, codec: null, container: 'mpeg', bitrateKbps: 128, durationSec: 3 },
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.masterKey).toBe('masters/source.mp3')
  })

  it('rejects the legacy path-based payload with a reason', () => {
    const { masterKey: _omitted, ...rest } = valid
    const result = parseConvertAudioJob({
      ...rest,
      inputPath: '/storage/source.mp3',
      outputDir: '/storage',
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.reason).toContain('masterKey')
  })

  it.each([
    ['an absolute key', { masterKey: '/etc/passwd' }],
    ['a traversing key', { masterKey: 'masters/../../x' }],
    ['an empty bitrate list', { bitrates: [] }],
    ['a malformed bitrate', { bitrates: ['fast'] }],
    ['a missing track id', { trackId: '' }],
  ])('rejects %s', (_name, override) => {
    expect(parseConvertAudioJob({ ...valid, ...override }).success).toBe(false)
  })

  it('rejects non-object data', () => {
    expect(parseConvertAudioJob(null).success).toBe(false)
    expect(parseConvertAudioJob('x').success).toBe(false)
  })
})
