import { describe, expect, it } from 'vitest'
import { FfmpegError, runFfmpeg, TailByteBuffer } from './ffmpeg-process.mjs'

/** Runs a small inline Node script as the "ffmpeg" binary — no real ffmpeg needed. */
const fakeBinary = process.execPath

/** @param {string} script */
const scriptArgs = (script) => ['-e', script]

describe('TailByteBuffer', () => {
  it('returns everything when under the limit', () => {
    const tail = new TailByteBuffer(1024)
    tail.push(Buffer.from('hello '))
    tail.push(Buffer.from('world'))
    expect(tail.toString()).toBe('hello world')
  })

  it('keeps exactly the last N bytes across chunk boundaries', () => {
    const tail = new TailByteBuffer(5)
    tail.push(Buffer.from('abc'))
    tail.push(Buffer.from('def'))
    tail.push(Buffer.from('ghi'))
    // Total pushed: "abcdefghi" (9 bytes). Last 5 bytes: "efghi".
    expect(tail.toString()).toBe('efghi')
  })

  it('produces the correct tail for one-byte-at-a-time pushes', () => {
    const tail = new TailByteBuffer(4)
    const source = '0123456789'
    for (const char of source) {
      tail.push(Buffer.from(char))
    }
    expect(tail.toString()).toBe(source.slice(-4))
  })

  it('decodes leniently when a multi-byte UTF-8 character is split by the cut', () => {
    /** "€" is E2 82 AC in UTF-8 — three bytes, split across two chunks. */
    const euro = Buffer.from('€', 'utf8')
    expect(euro.length).toBe(3)

    const tail = new TailByteBuffer(2)
    tail.push(euro.subarray(0, 2))
    tail.push(euro.subarray(2))
    // Keeping only the last 2 of 3 bytes lands mid-character; decoding must
    // not throw, and must not silently reproduce the original character.
    expect(() => tail.toString()).not.toThrow()
    expect(tail.toString()).not.toBe('€')
  })

  it('returns an empty string when nothing was pushed', () => {
    expect(new TailByteBuffer(16).toString()).toBe('')
  })
})

describe('runFfmpeg — success path', () => {
  it('resolves with durationMs and stderrTail', async () => {
    const result = await runFfmpeg(scriptArgs('process.exit(0)'), { ffmpegPath: fakeBinary })
    expect(result.stderrTail).toBe('')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('captures stderr output on success', async () => {
    const result = await runFfmpeg(
      scriptArgs('process.stderr.write("frame=1\\n"); process.exit(0)'),
      { ffmpegPath: fakeBinary },
    )
    expect(result.stderrTail).toContain('frame=1')
  })

  it('forwards each stderr chunk to onLog', async () => {
    const messages = []
    await runFfmpeg(scriptArgs('process.stderr.write("hello from ffmpeg"); process.exit(0)'), {
      ffmpegPath: fakeBinary,
      onLog: (message) => messages.push(message),
    })
    expect(messages.join('')).toContain('hello from ffmpeg')
  })

  it('does not call onLog when nothing is written to stderr', async () => {
    const messages = []
    await runFfmpeg(scriptArgs('process.exit(0)'), {
      ffmpegPath: fakeBinary,
      onLog: (message) => messages.push(message),
    })
    expect(messages).toHaveLength(0)
  })
})

describe('runFfmpeg — exit code failure', () => {
  it('throws FfmpegError with the exit code and a short message', async () => {
    await expect(
      runFfmpeg(scriptArgs('process.exit(1)'), { ffmpegPath: fakeBinary }),
    ).rejects.toMatchObject({
      name: 'FfmpegError',
      exitCode: 1,
      timedOut: false,
      signal: null,
      message: 'ffmpeg exited with code 1',
    })
  })

  it('sets cause to the underlying execa error', async () => {
    try {
      await runFfmpeg(scriptArgs('process.exit(2)'), { ffmpegPath: fakeBinary })
      expect.unreachable('runFfmpeg should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(FfmpegError)
      expect(error.cause).toBeDefined()
      expect(error.cause.exitCode).toBe(2)
    }
  })

  it('includes stderr output in stderrTail', async () => {
    await expect(
      runFfmpeg(scriptArgs('process.stderr.write("Unknown encoder"); process.exit(1)'), {
        ffmpegPath: fakeBinary,
      }),
    ).rejects.toMatchObject({ stderrTail: 'Unknown encoder' })
  })

  it('never embeds an absolute path or the full command line in the message', async () => {
    try {
      await runFfmpeg(scriptArgs('process.exit(1)'), {
        ffmpegPath: fakeBinary,
      })
      expect.unreachable('runFfmpeg should have thrown')
    } catch (error) {
      expect(error.message).not.toContain(fakeBinary)
      expect(error.message).not.toContain('/')
      expect(error.message).toBe('ffmpeg exited with code 1')
    }
  })

  it('bounds stderrTail to stderrTailBytes', async () => {
    const longLine = 'x'.repeat(1000)
    await expect(
      runFfmpeg(scriptArgs(`process.stderr.write(${JSON.stringify(longLine)}); process.exit(1)`), {
        ffmpegPath: fakeBinary,
        stderrTailBytes: 100,
      }),
    ).rejects.toSatisfy((error) => error.stderrTail.length <= 100)
  })
})

describe('runFfmpeg — signal kill', () => {
  it('throws FfmpegError with the signal set', async () => {
    await expect(
      runFfmpeg(scriptArgs('process.kill(process.pid, "SIGKILL")'), { ffmpegPath: fakeBinary }),
    ).rejects.toMatchObject({
      name: 'FfmpegError',
      signal: 'SIGKILL',
      timedOut: false,
      message: 'ffmpeg killed by SIGKILL',
    })
  })
})

describe('runFfmpeg — timeout', () => {
  it('sets timedOut and kills the child', async () => {
    const startedAt = Date.now()
    await expect(
      runFfmpeg(scriptArgs('setInterval(() => {}, 1000)'), {
        ffmpegPath: fakeBinary,
        timeoutMs: 100,
      }),
    ).rejects.toMatchObject({
      name: 'FfmpegError',
      timedOut: true,
      message: 'ffmpeg timed out after 100ms',
    })
    // The hanging child never exits on its own (setInterval keeps it alive
    // indefinitely) — a bounded elapsed time proves the timeout actually
    // terminated the process rather than the test waiting it out.
    expect(Date.now() - startedAt).toBeLessThan(5_000)
  })
})
