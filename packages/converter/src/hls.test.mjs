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
  it('creates aligned four-second multi-bitrate fragmented MP4 HLS variants', async () => {
    const result = await convertAudioToHls({
      input: '/music/track.mp3',
      outputDir: '/music/track.hls',
      bitrates: ['128k', '192k'],
    })

    expect(fsMocks.mkdir).toHaveBeenCalledWith('/music/track.hls', { recursive: true })
    expect(fsMocks.mkdir).toHaveBeenCalledWith('/music/track.hls/128', { recursive: true })
    expect(fsMocks.mkdir).toHaveBeenCalledWith('/music/track.hls/192', { recursive: true })
    expect(execaMock).toHaveBeenCalledWith(
      '/fake/ffmpeg',
      expect.arrayContaining([
        '-c:a:0',
        'aac',
        '-b:a:1',
        '192k',
        '-hls_time',
        '4',
        '-hls_segment_type',
        'fmp4',
        '-var_stream_map',
        'a:0,name:128 a:1,name:192',
        '-master_pl_name',
        'master.m3u8',
      ]),
    )
    expect(result.masterPlaylist).toBe('/music/track.hls/master.m3u8')
  })

  it('passes an FFmpeg timeout when requested', async () => {
    await convertAudioToHls({
      input: '/music/track.mp3',
      outputDir: '/music/track.hls',
      bitrates: ['192k'],
      timeoutMs: 600_000,
    })

    expect(execaMock).toHaveBeenCalledWith('/fake/ffmpeg', expect.any(Array), { timeout: 600_000 })
  })

  it('rejects invalid bitrate syntax', async () => {
    await expect(
      convertAudioToHls({ input: '/a.mp3', outputDir: '/hls', bitrates: ['192'] }),
    ).rejects.toThrow('Invalid bitrate format')
  })

  it('rejects invalid segment duration', async () => {
    await expect(
      convertAudioToHls({
        input: '/a.mp3',
        outputDir: '/hls',
        bitrates: ['128k'],
        segmentDuration: 0,
      }),
    ).rejects.toThrow('Segment duration')
  })
})
