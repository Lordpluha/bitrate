import { execa } from 'execa'
import ffmpegPathDefault from 'ffmpeg-static'

/** Default number of trailing stderr bytes retained for diagnostics. */
const DEFAULT_STDERR_TAIL_BYTES = 16_384

/** Grace period execa waits after SIGTERM before sending SIGKILL. */
const FORCE_KILL_AFTER_DELAY_MS = 5_000

/**
 * Bounded ring buffer of the last `maxBytes` bytes written to it, correct
 * across chunk boundaries. Decoding to a string happens once, at `toString()`
 * time, and leniently replaces any multi-byte UTF-8 sequence split by the cut.
 */
export class TailByteBuffer {
  #maxBytes
  #chunks = []
  #size = 0

  constructor(maxBytes) {
    this.#maxBytes = maxBytes
  }

  /** @param {Uint8Array} chunk */
  push(chunk) {
    if (this.#maxBytes <= 0) return
    this.#chunks.push(chunk)
    this.#size += chunk.length
    while (this.#chunks.length > 1 && this.#size - this.#chunks[0].length >= this.#maxBytes) {
      this.#size -= this.#chunks[0].length
      this.#chunks.shift()
    }
  }

  /** @returns {string} the retained bytes, leniently decoded as UTF-8 */
  toString() {
    if (this.#chunks.length === 0) return ''
    const combined = Buffer.concat(this.#chunks, this.#size)
    const tail =
      combined.length > this.#maxBytes
        ? combined.subarray(combined.length - this.#maxBytes)
        : combined
    return tail.toString('utf8')
  }
}

/**
 * Thrown when an FFmpeg invocation fails, times out, or is killed by a
 * signal. The message is deliberately short — no command line, no absolute
 * paths — callers redact/classify further from `stderrTail`/`args` if the
 * caller chooses to expose them.
 */
export class FfmpegError extends Error {
  /**
   * @param {string} message
   * @param {Object} details
   * @param {number | null} details.exitCode
   * @param {string | null} details.signal
   * @param {boolean} details.timedOut
   * @param {string} details.stderrTail
   * @param {string[]} details.args
   * @param {number} details.durationMs
   * @param {unknown} [details.cause]
   */
  constructor(message, { exitCode, signal, timedOut, stderrTail, args, durationMs, cause }) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'FfmpegError'
    this.exitCode = exitCode ?? null
    this.signal = signal ?? null
    this.timedOut = timedOut ?? false
    this.stderrTail = stderrTail ?? ''
    this.args = args ?? []
    this.durationMs = durationMs ?? 0
  }
}

/**
 * @param {{ timedOut: boolean, signal?: string | null, exitCode?: number | null }} error
 * @param {number | undefined} timeoutMs
 * @returns {string}
 */
function buildShortMessage(error, timeoutMs) {
  if (error.timedOut) {
    return `ffmpeg timed out after ${timeoutMs}ms`
  }

  if (error.signal) {
    return `ffmpeg killed by ${error.signal}`
  }

  if (typeof error.exitCode === 'number') {
    return `ffmpeg exited with code ${error.exitCode}`
  }

  return 'ffmpeg failed'
}

/**
 * Runs FFmpeg via execa without buffering stderr in full: a bounded ring
 * buffer keeps only the last `stderrTailBytes` bytes for diagnostics. On
 * failure throws {@link FfmpegError} with `cause` set to the underlying
 * execa error.
 * @param {string[]} args
 * @param {Object} [options]
 * @param {string} [options.ffmpegPath] - defaults to the `ffmpeg-static` binary
 * @param {number} [options.timeoutMs]
 * @param {number} [options.stderrTailBytes]
 * @param {(message: string) => void} [options.onLog]
 * @returns {Promise<{durationMs: number, stderrTail: string}>}
 */
export async function runFfmpeg(args, options = {}) {
  const {
    ffmpegPath = ffmpegPathDefault,
    timeoutMs,
    stderrTailBytes = DEFAULT_STDERR_TAIL_BYTES,
    onLog = () => {},
  } = options

  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found. Ensure ffmpeg-static is installed correctly.')
  }

  const tail = new TailByteBuffer(stderrTailBytes)

  /**
   * Side-effecting binary transform: captures every stderr chunk into the
   * bounded tail buffer and forwards it to `onLog`, without yielding
   * anything — so execa never accumulates stderr into `result.stderr`.
   * @param {Uint8Array} chunk
   */
  // biome-ignore lint/correctness/useYield: execa requires a Generator/AsyncGeneratorFunction for a binary transform; this one is side-effect-only by design (see the TSDoc above) and never yields.
  function* captureStderr(chunk) {
    tail.push(chunk)
    onLog(Buffer.from(chunk).toString('utf8'))
  }

  const execaOptions = {
    stderr: { transform: captureStderr, binary: true },
    ...(timeoutMs === undefined
      ? {}
      : { timeout: timeoutMs, forceKillAfterDelay: FORCE_KILL_AFTER_DELAY_MS }),
  }

  const startedAt = Date.now()

  try {
    await execa(ffmpegPath, args, execaOptions)
    return { durationMs: Date.now() - startedAt, stderrTail: tail.toString() }
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const stderrTail = tail.toString()
    const message = buildShortMessage(error, timeoutMs)

    throw new FfmpegError(message, {
      exitCode: typeof error.exitCode === 'number' ? error.exitCode : null,
      signal: error.signal ?? null,
      timedOut: Boolean(error.timedOut),
      stderrTail,
      args,
      durationMs,
      cause: error,
    })
  }
}
