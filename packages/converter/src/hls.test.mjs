import { beforeEach, describe, expect, it, vi } from 'vitest'

const fsMocks = vi.hoisted(() => ({
  access: vi.fn(),
  mkdir: vi.fn(),
}))
const execaMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs/promises', () => ({ default: fsMocks }))
vi.mock('execa', () => ({ execa: execaMock }))
vi.mock('ffmpeg-static', () => ({ default: '/fake/ffmpeg' }))

import { convertAudioToHls } from './hls.mjs'

beforeEach(() => {
  vi.clearAllMocks()
  fsMocks.access.mockResolvedValue(undefined)
  fsMocks.mkdir.mockResolvedValue(undefined)
  execaMock.mockResolvedValue({})
})

describe('convertAudioToHls', () => {
  it('creates ten-second fragmented MP4 HLS segments', async () => {
    const result = await convertAudioToHls({
      input: '/music/track.mp3',
      outputDir: '/music/track.hls',
      bitrate: '192k',
    })

    expect(fsMocks.mkdir).toHaveBeenCalledWith('/music/track.hls', { recursive: true })
    expect(execaMock).toHaveBeenCalledWith(
      '/fake/ffmpeg',
      expect.arrayContaining([
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-hls_time',
        '10',
        '-hls_segment_type',
        'fmp4',
      ]),
    )
    expect(result.playlist).toBe('/music/track.hls/index.m3u8')
  })

  it('passes an FFmpeg timeout when requested', async () => {
    await convertAudioToHls({
      input: '/music/track.mp3',
      outputDir: '/music/track.hls',
      bitrate: '192k',
      timeoutMs: 600_000,
    })

    expect(execaMock).toHaveBeenCalledWith('/fake/ffmpeg', expect.any(Array), { timeout: 600_000 })
  })

  it('rejects invalid bitrate syntax', async () => {
    await expect(
      convertAudioToHls({ input: '/a.mp3', outputDir: '/hls', bitrate: '192' }),
    ).rejects.toThrow('Bitrate must use')
  })

  it('rejects invalid segment duration', async () => {
    await expect(
      convertAudioToHls({
        input: '/a.mp3',
        outputDir: '/hls',
        bitrate: '128k',
        segmentDuration: 0,
      }),
    ).rejects.toThrow('Segment duration')
  })
})
