import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** Points drawn for one recording; enough for a full-width bar chart, small enough to embed. */
const WAVEFORM_POINTS = 200

/** Mono samples per second decoded for the waveform; peaks need shape, not fidelity. */
const SAMPLE_RATE = 8000

/** ffmpeg gets this long before the waveform is left empty instead of failing the upload. */
const DECODE_TIMEOUT_MS = 60_000

/** A ten-minute master at 8 kHz mono 16-bit is ~9.6 MB; anything far beyond is not a master. */
const MAX_PCM_BYTES = 64 * 1024 * 1024

/**
 * Peak level per bucket, scaled so the loudest bucket is 1 and rounded to three decimals.
 * Silence stays at zero rather than being stretched into noise.
 */
export function waveformFromPcm(samples: Int16Array, points: number = WAVEFORM_POINTS): number[] {
  const count = Math.min(points, samples.length)
  if (count === 0) return []
  const size = samples.length / count
  const peaks: number[] = []
  for (let bucket = 0; bucket < count; bucket += 1) {
    const end = Math.max(Math.floor((bucket + 1) * size), Math.floor(bucket * size) + 1)
    let peak = 0
    for (let index = Math.floor(bucket * size); index < end; index += 1) {
      peak = Math.max(peak, Math.abs(samples[index] ?? 0))
    }
    peaks.push(peak)
  }
  const loudest = Math.max(...peaks)
  return loudest === 0
    ? peaks.map(() => 0)
    : peaks.map((peak) => Math.round((peak / loudest) * 1000) / 1000)
}

/** Decodes `path` to mono PCM with ffmpeg; an unreadable file yields an empty waveform. */
export async function extractWaveform(path: string): Promise<number[]> {
  try {
    const { stdout } = await execFileAsync(
      'ffmpeg',
      ['-v', 'error', '-i', path, '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 's16le', 'pipe:1'],
      { encoding: 'buffer', maxBuffer: MAX_PCM_BYTES, timeout: DECODE_TIMEOUT_MS },
    )
    // Copy into an aligned buffer: a Node Buffer may start at an odd byte offset.
    const bytes = new Uint8Array(stdout)
    return waveformFromPcm(new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2)))
  } catch {
    return []
  }
}
