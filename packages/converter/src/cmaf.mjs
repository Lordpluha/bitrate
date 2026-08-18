import fs from 'node:fs/promises'
import { join } from 'node:path'
import { execa } from 'execa'
import ffmpegPath from 'ffmpeg-static'
import { assertAlignedRenditions, buildFragmentIndex } from './mp4-index.mjs'

/** AAC-LC always encodes 1024 samples per frame. */
const AAC_FRAME_SAMPLES = 1024

/** Every rendition is forced to this layout so fragments stay interchangeable. */
const SAMPLE_RATE = 48000
const CHANNELS = 2

/**
 * Fragment length in whole AAC frames. 192 frames = 4.096 s at 48 kHz, which
 * keeps the boundary on an exact frame edge — a fractional target lets FFmpeg
 * round differently per rendition and the fragments stop lining up.
 */
const DEFAULT_FRAGMENT_FRAMES = 192

/**
 * @param {number} frames
 * @returns {number} fragment duration in microseconds
 */
const framesToMicroseconds = (frames) =>
  Math.round((frames * AAC_FRAME_SAMPLES * 1_000_000) / SAMPLE_RATE)

/**
 * Encodes one CMAF/fMP4 file per bitrate in a single FFmpeg run, so the source
 * is decoded once and every rendition shares the same fragment boundaries.
 *
 * @param {Object} options
 * @param {string} options.input
 * @param {string} options.outputDir
 * @param {number[]} options.bitrates - kbps, e.g. [128, 192, 320]
 * @param {number} [options.fragmentFrames=192]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<{outputDir: string, timescale: number, durationTicks: number, renditions: {bitrate: number, path: string, size: number, initRange: [number, number], indexRange: [number, number], fragments: {startTicks: number, durationTicks: number, offset: number, length: number}[]}[]}>}
 */
export async function convertAudioToCmaf({
  input,
  outputDir,
  bitrates,
  fragmentFrames = DEFAULT_FRAGMENT_FRAMES,
  timeoutMs,
}) {
  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found. Ensure ffmpeg-static is installed correctly.')
  }

  try {
    await fs.access(input)
  } catch {
    throw new Error(`Input file not found: ${input}`)
  }

  if (!Array.isArray(bitrates) || bitrates.length === 0) {
    throw new Error('At least one bitrate must be specified')
  }

  for (const bitrate of bitrates) {
    if (!Number.isInteger(bitrate) || bitrate < 32 || bitrate > 512) {
      throw new Error(`Invalid bitrate: ${bitrate}. Use kbps between 32 and 512, e.g. 192`)
    }
  }

  if (new Set(bitrates).size !== bitrates.length) {
    throw new Error('Bitrates must be unique')
  }

  if (!Number.isInteger(fragmentFrames) || fragmentFrames < 1) {
    throw new Error('fragmentFrames must be a positive integer')
  }

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
    throw new Error('Timeout must be a positive number')
  }

  await fs.mkdir(outputDir, { recursive: true })

  const ordered = [...bitrates].sort((left, right) => left - right)
  const outputs = ordered.map((bitrate) => ({
    bitrate,
    path: join(outputDir, `${bitrate}.m4a`),
  }))

  const fragDuration = String(framesToMicroseconds(fragmentFrames))
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', input]

  for (const { bitrate, path } of outputs) {
    args.push(
      '-map',
      '0:a:0',
      '-vn',
      '-c:a',
      'aac',
      '-b:a',
      `${bitrate}k`,
      '-ar',
      String(SAMPLE_RATE),
      '-ac',
      String(CHANNELS),
      /** `+cmaf` writes CMAF-compliant fMP4; `+global_sidx` puts the index up front. */
      '-movflags',
      '+cmaf+global_sidx',
      '-frag_duration',
      fragDuration,
      path,
    )
  }

  try {
    if (timeoutMs === undefined) {
      await execa(ffmpegPath, args)
    } else {
      await execa(ffmpegPath, args, { timeout: timeoutMs })
    }
  } catch (error) {
    throw new Error(`FFmpeg CMAF error: ${error instanceof Error ? error.message : error}`)
  }

  const renditions = []

  for (const { bitrate, path } of outputs) {
    const data = await fs.readFile(path)
    const index = buildFragmentIndex(data)
    renditions.push({ bitrate, path, size: data.length, index })
  }

  assertAlignedRenditions(renditions)

  const [first] = renditions

  return {
    outputDir,
    timescale: first.index.timescale,
    durationTicks: first.index.durationTicks,
    renditions: renditions.map(({ bitrate, path, size, index }) => ({
      bitrate,
      path,
      size,
      initRange: index.initRange,
      indexRange: index.indexRange,
      fragments: index.fragments,
    })),
  }
}
