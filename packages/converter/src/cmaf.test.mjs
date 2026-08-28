import { beforeEach, describe, expect, it, vi } from 'vitest'

const fsMocks = vi.hoisted(() => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  open: vi.fn(),
}))
const execaMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs/promises', () => ({ default: fsMocks }))
vi.mock('execa', () => ({ execa: execaMock }))
vi.mock('ffmpeg-static', () => ({ default: '/fake/ffmpeg' }))

import { convertAudioToCmaf } from './cmaf.mjs'

const box = (type, payload = Buffer.alloc(0)) => {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(8 + payload.length, 0)
  header.write(type, 4, 'latin1')
  return Buffer.concat([header, payload])
}

/** Builds a synthetic `+cmaf+global_sidx` file with the given fragment sizes. */
const fakeRendition = (fragmentSizes, durationTicks = 196608) => {
  const head = Buffer.alloc(24)
  head.writeUInt8(0, 0)
  head.writeUInt32BE(1, 4)
  head.writeUInt32BE(48000, 8)
  head.writeUInt32BE(0, 12)
  head.writeUInt32BE(0, 16)
  head.writeUInt16BE(0, 20)
  head.writeUInt16BE(fragmentSizes.length, 22)

  const refs = Buffer.concat(
    fragmentSizes.map((size) => {
      const entry = Buffer.alloc(12)
      entry.writeUInt32BE(size, 0)
      entry.writeUInt32BE(durationTicks, 4)
      entry.writeUInt32BE(0, 8)
      return entry
    }),
  )

  return Buffer.concat([
    box('ftyp', Buffer.alloc(16)),
    box('moov', Buffer.alloc(64)),
    box('sidx', Buffer.concat([head, refs])),
    Buffer.alloc(fragmentSizes.reduce((total, size) => total + size, 0)),
  ])
}

const fileHandle = (data, reportedSize = data.length) => ({
  stat: vi.fn().mockResolvedValue({ size: reportedSize }),
  read: vi.fn().mockImplementation(async (target, offset, length, position) => {
    const available = Math.max(0, Math.min(length, data.length - position))
    data.copy(target, offset, position, position + available)
    return { bytesRead: available }
  }),
  close: vi.fn().mockResolvedValue(undefined),
})

beforeEach(() => {
  vi.clearAllMocks()
  fsMocks.access.mockResolvedValue(undefined)
  fsMocks.mkdir.mockResolvedValue(undefined)
  fsMocks.open.mockImplementation(async () => fileHandle(fakeRendition([1000, 1200])))
  execaMock.mockResolvedValue({})
})

describe('convertAudioToCmaf', () => {
  it('encodes every rendition in a single FFmpeg run so the source decodes once', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [128, 192, 320],
    })

    expect(execaMock).toHaveBeenCalledTimes(1)

    const [, args] = execaMock.mock.calls[0]
    expect(args.filter((arg) => arg === '-i')).toHaveLength(1)
    expect(args.filter((arg) => arg === '-map')).toHaveLength(3)
    expect(args).toContain('/music/track.cmaf/128.m4a')
    expect(args).toContain('/music/track.cmaf/320.m4a')
  })

  it('writes a global sidx and CMAF-compliant fragments', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [192],
    })

    const [, args] = execaMock.mock.calls[0]
    expect(args).toContain('+cmaf+global_sidx')
  })

  it('pins sample rate and channels so fragments stay interchangeable', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [128, 320],
    })

    const [, args] = execaMock.mock.calls[0]
    expect(args.filter((arg) => arg === '48000')).toHaveLength(2)
    expect(args.filter((arg) => arg === '2')).toHaveLength(2)
  })

  it('aligns fragments to whole AAC frames', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [192],
    })

    const [, args] = execaMock.mock.calls[0]
    const fragDuration = args[args.indexOf('-frag_duration') + 1]

    /** 192 frames x 1024 samples / 48000 Hz = 4.096 s exactly. */
    expect(fragDuration).toBe('4096000')
  })

  it('honours a custom fragment length in frames', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [192],
      fragmentFrames: 96,
    })

    const [, args] = execaMock.mock.calls[0]
    expect(args[args.indexOf('-frag_duration') + 1]).toBe('2048000')
  })

  it('returns the byte index each rendition needs for Range playback', async () => {
    const result = await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [128, 192],
    })

    expect(result.timescale).toBe(48000)
    expect(result.durationTicks).toBe(393216)
    expect(result.renditions).toHaveLength(2)

    const [first] = result.renditions
    expect(first.bitrate).toBe(128)
    expect(first.initRange).toEqual([0, 95])
    expect(first.fragments).toHaveLength(2)
    expect(first.fragments[0]).toMatchObject({ startTicks: 0, length: 1000 })
    expect(first.fragments[1].offset).toBe(first.fragments[0].offset + 1000)
  })

  it('orders renditions by bitrate regardless of input order', async () => {
    const result = await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [320, 128, 192],
    })

    expect(result.renditions.map((rendition) => rendition.bitrate)).toEqual([128, 192, 320])
  })

  it('fails the job when renditions do not share fragment boundaries', async () => {
    fsMocks.open
      .mockResolvedValueOnce(fileHandle(fakeRendition([1000, 1200])))
      .mockResolvedValueOnce(fileHandle(fakeRendition([1000, 1200, 900])))

    await expect(
      convertAudioToCmaf({
        input: '/music/track.mp3',
        outputDir: '/music/track.cmaf',
        bitrates: [128, 192],
      }),
    ).rejects.toThrow(/3 fragments, expected 2/)
  })

  it('passes an FFmpeg timeout when requested', async () => {
    await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [192],
      timeoutMs: 600_000,
    })

    expect(execaMock).toHaveBeenCalledWith('/fake/ffmpeg', expect.any(Array), { timeout: 600_000 })
  })

  it('indexes a multi-gigabyte rendition without reading the media payload into memory', async () => {
    const handle = fileHandle(fakeRendition([1000, 1200]), 5 * 1024 * 1024 * 1024)
    fsMocks.open.mockResolvedValueOnce(handle)

    const result = await convertAudioToCmaf({
      input: '/music/track.mp3',
      outputDir: '/music/track.cmaf',
      bitrates: [192],
    })

    expect(result.renditions[0].size).toBe(5 * 1024 * 1024 * 1024)
    const requestedLengths = handle.read.mock.calls.map(([, , length]) => length)
    expect(Math.max(...requestedLengths)).toBeLessThan(1024)
  })

  it.each([
    [[], /At least one bitrate/],
    [[0], /Invalid bitrate/],
    [[192, 192], /unique/i],
  ])('rejects invalid bitrates %j', async (bitrates, message) => {
    await expect(
      convertAudioToCmaf({ input: '/music/track.mp3', outputDir: '/out', bitrates }),
    ).rejects.toThrow(message)
  })

  it('reports a missing input file before spawning FFmpeg', async () => {
    fsMocks.access.mockRejectedValue(new Error('nope'))

    await expect(
      convertAudioToCmaf({ input: '/missing.mp3', outputDir: '/out', bitrates: [192] }),
    ).rejects.toThrow(/Input file not found/)
    expect(execaMock).not.toHaveBeenCalled()
  })
})
