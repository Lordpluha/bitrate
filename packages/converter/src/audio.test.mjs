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

// ── Import under test (uses mocked modules) ────────────────────────────────
import { convertAudio } from './audio.mjs'

/** The options object runFfmpeg always passes to execa for stderr capture. */
const stderrCaptureOptions = { stderr: { transform: expect.any(Function), binary: true } }

// ── Defaults reset before every test ──────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  fsMocks.access.mockResolvedValue(undefined)
  fsMocks.stat.mockResolvedValue({ size: 1024 * 1024 }) // 1 MB
  execaMock.mockResolvedValue({})
})

// ── Tests ──────────────────────────────────────────────────────────────────
describe('convertAudio', () => {
  describe('input validation', () => {
    it('throws when the input file does not exist', async () => {
      fsMocks.access.mockRejectedValueOnce(new Error('ENOENT'))
      await expect(convertAudio({ input: '/missing.mp3' })).rejects.toThrow(
        'Input file not found: /missing.mp3',
      )
    })

    it('throws for quality below 0', async () => {
      await expect(convertAudio({ input: '/a.mp3', quality: -1 })).rejects.toThrow(
        'Quality must be between 0 and 10',
      )
    })

    it('throws for quality above 10', async () => {
      await expect(convertAudio({ input: '/a.mp3', quality: 11 })).rejects.toThrow(
        'Quality must be between 0 and 10',
      )
    })

    it('accepts quality at boundary values 0 and 10', async () => {
      await expect(convertAudio({ input: '/a.mp3', quality: 0 })).resolves.toBeDefined()
      await expect(convertAudio({ input: '/a.mp3', quality: 10 })).resolves.toBeDefined()
    })

    it('throws for an invalid application type', async () => {
      await expect(convertAudio({ input: '/a.mp3', application: 'invalid' })).rejects.toThrow(
        'Invalid application type',
      )
    })

    it('accepts all valid application types', async () => {
      for (const application of ['audio', 'voip', 'lowdelay']) {
        await expect(convertAudio({ input: '/a.mp3', application })).resolves.toBeDefined()
      }
    })
  })

  describe('output path derivation', () => {
    it('replaces the extension with .opus when no output is given', async () => {
      const result = await convertAudio({ input: '/music/song.mp3' })
      expect(result.output).toBe('/music/song.opus')
    })

    it('replaces any extension, not just .mp3', async () => {
      const result = await convertAudio({ input: '/track.flac' })
      expect(result.output).toBe('/track.opus')
    })

    it('uses the provided output path verbatim', async () => {
      const result = await convertAudio({ input: '/a.mp3', output: '/custom/out.opus' })
      expect(result.output).toBe('/custom/out.opus')
    })
  })

  describe('FFmpeg arguments', () => {
    it('passes the fake ffmpeg binary path to execa', async () => {
      await convertAudio({ input: '/a.mp3' })
      expect(execaMock).toHaveBeenCalledWith(
        '/fake/ffmpeg',
        expect.any(Array),
        stderrCaptureOptions,
      )
    })

    it('passes -i with the input path', async () => {
      await convertAudio({ input: '/my/track.mp3' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-i', '/my/track.mp3']),
        stderrCaptureOptions,
      )
    })

    it('uses the libopus codec', async () => {
      await convertAudio({ input: '/a.mp3' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-c:a', 'libopus']),
        stderrCaptureOptions,
      )
    })

    it('passes the requested bitrate', async () => {
      await convertAudio({ input: '/a.mp3', bitrate: '192k' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-b:a', '192k']),
        stderrCaptureOptions,
      )
    })

    it('passes -vbr off when vbr is false (default)', async () => {
      await convertAudio({ input: '/a.mp3', vbr: false })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-vbr', 'off']),
        stderrCaptureOptions,
      )
    })

    it('passes -vbr on when vbr is true', async () => {
      await convertAudio({ input: '/a.mp3', vbr: true })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-vbr', 'on']),
        stderrCaptureOptions,
      )
    })

    it('passes the application type', async () => {
      await convertAudio({ input: '/a.mp3', application: 'voip' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-application', 'voip']),
        stderrCaptureOptions,
      )
    })

    it('passes the compression level as a string', async () => {
      await convertAudio({ input: '/a.mp3', quality: 7 })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-compression_level', '7']),
        stderrCaptureOptions,
      )
    })

    it('passes an FFmpeg timeout when requested', async () => {
      await convertAudio({ input: '/a.mp3', timeoutMs: 600_000 })
      expect(execaMock).toHaveBeenCalledWith('/fake/ffmpeg', expect.any(Array), {
        ...stderrCaptureOptions,
        timeout: 600_000,
        forceKillAfterDelay: 5_000,
      })
    })

    it('passes -y to allow overwriting the output file', async () => {
      await convertAudio({ input: '/a.mp3' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-y']),
        stderrCaptureOptions,
      )
    })

    it('suppresses ffmpeg banner output', async () => {
      await convertAudio({ input: '/a.mp3' })
      expect(execaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['-hide_banner', '-loglevel', 'error']),
        stderrCaptureOptions,
      )
    })
  })

  describe('return value', () => {
    it('returns the input and output paths', async () => {
      const result = await convertAudio({ input: '/a.mp3', output: '/b.opus' })
      expect(result.input).toBe('/a.mp3')
      expect(result.output).toBe('/b.opus')
    })

    it('returns inputSize and outputSize as human-readable strings', async () => {
      fsMocks.stat
        .mockResolvedValueOnce({ size: 2 * 1024 * 1024 }) // input: 2 MB
        .mockResolvedValueOnce({ size: 512 * 1024 }) // output: 512 KB

      const result = await convertAudio({ input: '/a.mp3' })
      expect(result.inputSize).toContain('MB')
      expect(result.outputSize).toContain('KB')
    })

    it('propagates an FfmpegError on ffmpeg failure', async () => {
      const execaError = Object.assign(new Error('codec not found'), { exitCode: 1 })
      execaMock.mockRejectedValueOnce(execaError)
      await expect(convertAudio({ input: '/a.mp3' })).rejects.toMatchObject({
        name: 'FfmpegError',
        exitCode: 1,
      })
    })
  })

  describe('onLog', () => {
    it('receives the conversion banner and completion messages', async () => {
      const messages = []
      await convertAudio({ input: '/a.mp3', onLog: (message) => messages.push(message) })
      expect(messages.some((message) => message.includes('Converting audio'))).toBe(true)
      expect(messages.some((message) => message.includes('Conversion complete'))).toBe(true)
    })

    it('defaults to a no-op when omitted', async () => {
      await expect(convertAudio({ input: '/a.mp3' })).resolves.toBeDefined()
    })
  })

  describe('formatBytes (via return value)', () => {
    const cases = [
      [0, '0 B'],
      [512, '512 B'],
      [1024, '1 KB'],
      [1536, '1.5 KB'],
      [1024 * 1024, '1 MB'],
      [Math.round(2.5 * 1024 * 1024), '2.5 MB'],
    ]

    for (const [size, label] of cases) {
      it(`formats ${size} bytes as "${label}"`, async () => {
        fsMocks.stat.mockResolvedValueOnce({ size }).mockResolvedValueOnce({ size })

        const result = await convertAudio({ input: '/a.mp3' })
        expect(result.inputSize).toBe(label)
      })
    }
  })
})
