import { setTimeout as delay } from 'node:timers/promises'
import { audioMsBetween, type RenditionSegment } from './playback-segment'
import { PlaybackPacingError } from './playback-session.service'

/** Input for {@link pacedChunks}. */
export type PacedChunksInput = {
  /** The rendition bytes from `startByte` on, as storage streams them. */
  source: AsyncIterable<Buffer | Uint8Array>
  startByte: number
  segments: RenditionSegment[]
  /** Charges the session; rejects with {@link PlaybackPacingError} while it is ahead of real time. */
  charge: (audioMs: number) => Promise<void>
  /** Waits between refused charges; injectable so specs need no real delay. */
  sleep?: (ms: number) => Promise<void>
  /** Aborted when the listener disconnects; a held-back chunk is then dropped. */
  signal?: AbortSignal
}

/**
 * Releases a rendition no faster than the session's real-time budget (ADR-0067, D15): each chunk
 * is charged for the audio it carries before it is passed on, and a refused charge waits for the
 * budget instead of failing, so a native `<audio>` keeps its one long response.
 */
export async function* pacedChunks({
  source,
  startByte,
  segments,
  charge,
  sleep = (ms) => delay(ms),
  signal,
}: PacedChunksInput): AsyncGenerator<Buffer> {
  let position = startByte
  for await (const raw of source) {
    const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
    const audioMs = audioMsBetween(segments, position, position + chunk.length - 1)

    while (true) {
      if (signal?.aborted) return
      try {
        await charge(audioMs)
        break
      } catch (error) {
        if (!(error instanceof PlaybackPacingError)) throw error
        await sleep(error.retryAfterSeconds * 1000)
      }
    }

    if (signal?.aborted) return
    yield chunk
    position += chunk.length
  }
}
