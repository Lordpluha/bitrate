import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ──────────────────────────────────────────────────────────
const fsMocks = vi.hoisted(() => ({
  access: vi.fn(),
  stat: vi.fn(),
}))

const execaMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs/promises', () => ({ default: fsMocks }))
vi.mock('execa', () => ({ execa: execaMock }))
vi.mock('ffmpeg-static', () => ({ default: '/fake/ffmpeg' }))

// ── Import under test ──────────────────────────────────────────────────────
import { convertVideo } from './video.mjs'

beforeEach(() => {
  vi.clearAllMocks()
  fsMocks.access.mockResolvedValue(undefined)
  fsMocks.stat.mockResolvedValue({ size: 1024 * 1024 })
  execaMock.mockResolvedValue({})
})

// ── Tests ──────────────────────────────────────────────────────────────────
describe('convertVideo', () => {
  describe('input validation', () => {
    it('throws when the input file does not exist', async () => {
      fsMocks.access.mockRejectedValueOnce(new Error('ENOENT'))
      await expect(convertVideo({ input: '/missing.mp4' })).rejects.toThrow(
        'Input file not found: /missing.mp4',
      )
    })

    it('throws for quality below 0.1', async () => {
      await expect(convertVideo({ input: '/a.mp4', quality: 0.05 })).rejects.toThrow(
        'Quality must be between 0.1 and 2',
      )
    })

    it('throws for quality above 2', async () => {
      await expect(convertVideo({ input: '/a.mp4', quality: 2.1 })).rejects.toThrow(
        'Quality must be between 0.1 and 2',
      )
    })

    it('accepts quality at boundary values 0.1 and 2', async () => {
      await expect(convertVideo({ input: '/a.mp4', quality: 0.1 })).resolves.toBeDefined()
      await expect(convertVideo({ input: '/a.mp4', quality: 2 })).resolves.toBeDefined()
    })

    it('throws for an invalid AAC profile', async () => {
      await expect(convertVideo({ input: '/a.mp4', profile: 'invalid' })).rejects.toThrow(
        'Invalid AAC profile',
      )
    })

    it('accepts all valid AAC profiles', async () => {
      for (const profile of ['aac_low', 'aac_he', 'aac_he_v2']) {
        await expect(convertVideo({ input: '/a.mp4', profile })).resolves.toBeDefined()
      }
    })
  })

  describe('output path derivation', () => {
    it('replaces the extension with .m4a when no output is given', async () => {
      const result = await convertVideo({ input: '/video/clip.mp4' })
      expect(result.output).toBe('/video/clip.m4a')
    })

    it('replaces any extension, not just .mp4', async () => {
      const result = await convertVideo({ input: '/movie.mkv' })
      expect(result.output).toBe('/movie.m4a')
    })

    it('uses the provided output path verbatim', async () => {
      const result = await convertVideo({ input: '/a.mp4', output: '/custom/out.m4a' })
      expect(result.output).toBe('/custom/out.m4a')
    })
  })

  describe('FFmpeg arguments', () => {
    it('passes the fake ffmpeg binary to execa', async () => {
      await convertVideo({ input: '/a.mp4' })
      expect(execaMock).toHaveBeenCalledWith('/fake/ffmpeg', expect.any(Array))
    })

    it('passes -i with the input path', async () => {
      await convertVideo({ input: '/my/video.mp4' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-i', '/my/video.mp4']),
      )
    })

    it('strips video stream with -vn', async () => {
      await convertVideo({ input: '/a.mp4' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-vn']),
      )
    })

    it('uses the AAC codec', async () => {
      await convertVideo({ input: '/a.mp4' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-c:a', 'aac']),
      )
    })

    it('passes the requested bitrate', async () => {
      await convertVideo({ input: '/a.mp4', bitrate: '256k' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-b:a', '256k']),
      )
    })

    it('passes the quality setting as a string', async () => {
      await convertVideo({ input: '/a.mp4', quality: 1.5 })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-q:a', '1.5']),
      )
    })

    it('passes the AAC profile', async () => {
      await convertVideo({ input: '/a.mp4', profile: 'aac_he' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-profile:a', 'aac_he']),
      )
    })

    it('passes -y to allow overwriting the output file', async () => {
      await convertVideo({ input: '/a.mp4' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-y']),
      )
    })

    it('suppresses ffmpeg banner output', async () => {
      await convertVideo({ input: '/a.mp4' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-hide_banner', '-loglevel', 'error']),
      )
    })
  })

  describe('return value', () => {
    it('returns the input and output paths', async () => {
      const result = await convertVideo({ input: '/a.mp4', output: '/b.m4a' })
      expect(result.input).toBe('/a.mp4')
      expect(result.output).toBe('/b.m4a')
    })

    it('returns inputSize and outputSize as human-readable strings', async () => {
      fsMocks.stat
        .mockResolvedValueOnce({ size: 50 * 1024 * 1024 }) // input: 50 MB
        .mockResolvedValueOnce({ size: 3 * 1024 * 1024 })  // output: 3 MB

      const result = await convertVideo({ input: '/a.mp4' })
      expect(result.inputSize).toBe('50 MB')
      expect(result.outputSize).toBe('3 MB')
    })

    it('wraps ffmpeg failures in a descriptive error', async () => {
      execaMock.mockRejectedValueOnce(new Error('encoder not found'))
      await expect(convertVideo({ input: '/a.mp4' })).rejects.toThrow('FFmpeg error')
    })
  })

  describe('formatBytes (via return value)', () => {
    const cases = [
      [0, '0 B'],
      [1536, '1.5 KB'],
      [1024, '1 KB'],
      [1024 * 1024, '1 MB'],
      [1024 * 1024 * 1024, '1 GB'],
    ]

    for (const [size, label] of cases) {
      it(`formats ${size} bytes as "${label}"`, async () => {
        fsMocks.stat
          .mockResolvedValueOnce({ size })
          .mockResolvedValueOnce({ size })

        const result = await convertVideo({ input: '/a.mp4' })
        expect(result.inputSize).toBe(label)
      })
    }
  })
})
