import fs from 'node:fs/promises'
import { join } from 'node:path'
import { runFfmpeg } from './ffmpeg-process.mjs'
import { assertAlignedRenditions, buildFragmentIndexFromFile } from './mp4-index.mjs'
import { packagerPath } from './packager-path.mjs'

/** AAC-LC frames are 1024 samples at the 48 kHz every rendition is encoded at. */
const FRAME_SECONDS = 1024 / 48_000

/** Same fragment length as `convertAudioToCmaf` (ADR-0065). */
const DEFAULT_FRAGMENT_FRAMES = 469

/**
 * The packager starts a new fragment once a sample reaches the target duration. Asking for one
 * millisecond less than the whole-frame length keeps the cut exactly on frame `fragmentFrames`
 * regardless of floating-point rounding; the previous frame starts ~21 ms earlier.
 */
const CUT_MARGIN_SECONDS = 0.001

const HEX_128_BIT = /^[0-9a-f]{32}$/

/**
 * Encrypts clear CMAF renditions with CENC `cbcs` (ADR-0077) through Shaka Packager in one run,
 * with a raw key, no clear lead and a W3C Common PSSH for ClearKey. The byte index is rebuilt
 * from the encrypted files, because encryption adds `senc`/`saiz`/`saio` to every fragment.
 *
 * @param {Object} options
 * @param {{bitrate: number, path: string}[]} options.renditions - clear `convertAudioToCmaf` output
 * @param {string} options.outputDir
 * @param {string} options.keyId - 128-bit key id, lowercase hex
 * @param {string} options.key - 128-bit content key, lowercase hex
 * @param {number[]} [options.clearBitrates=[]] - bitrates also packaged unencrypted, as
 *   `<bitrate>-clear.m4a`, for clients without ClearKey `cbcs`. Same run, so the same grid as
 *   the encrypted renditions — FFmpeg's own output differs by the priming frame in its index.
 * @param {number} [options.fragmentFrames=469]
 * @param {number} [options.timeoutMs]
 * @param {(message: string) => void} [options.onLog]
 * @returns {Promise<{outputDir: string, timescale: number, durationTicks: number, renditions: {bitrate: number, path: string, size: number, initRange: [number, number], indexRange: [number, number], fragments: {startTicks: number, durationTicks: number, offset: number, length: number}[], encryption: {scheme: 'cbcs', keyId: string}}[]}>}
 */
export async function encryptCmafRenditions({
  renditions,
  outputDir,
  keyId,
  key,
  clearBitrates = [],
  fragmentFrames = DEFAULT_FRAGMENT_FRAMES,
  timeoutMs,
  onLog = () => {},
}) {
  if (!HEX_128_BIT.test(keyId ?? '')) throw new Error('keyId must be 32 hex characters')
  if (!HEX_128_BIT.test(key ?? '')) throw new Error('key must be 32 hex characters')
  if (!Array.isArray(renditions) || renditions.length === 0) {
    throw new Error('At least one rendition must be given')
  }
  if (!Number.isInteger(fragmentFrames) || fragmentFrames < 1) {
    throw new Error('fragmentFrames must be a positive integer')
  }

  for (const bitrate of clearBitrates) {
    if (!renditions.some((rendition) => rendition.bitrate === bitrate)) {
      throw new Error(`clearBitrates lists ${bitrate}, which is not among the renditions`)
    }
  }

  await fs.mkdir(outputDir, { recursive: true })

  const outputs = [
    ...renditions.map(({ bitrate, path }) => ({
      bitrate,
      input: path,
      path: join(outputDir, `${bitrate}.m4a`),
      encrypted: true,
    })),
    ...clearBitrates.map((bitrate) => ({
      bitrate,
      source: renditions.find((rendition) => rendition.bitrate === bitrate).path,
      input: join(outputDir, `.${bitrate}-clear-source.m4a`),
      path: join(outputDir, `${bitrate}-clear.m4a`),
      encrypted: false,
    })),
  ]

  /**
   * A clear copy must not read the same input file as an encrypted stream: the packager demuxes
   * a shared input once and encrypts its samples in place, so the "clear" output would carry
   * encrypted bytes without signalling it. Each clear copy reads its own scratch copy.
   */
  const scratch = outputs.filter((output) => output.source)
  for (const { source, input } of scratch) await fs.copyFile(source, input)
  const fragmentSeconds = String(fragmentFrames * FRAME_SECONDS - CUT_MARGIN_SECONDS)

  const args = [
    ...outputs.map(
      ({ input, path, encrypted }) =>
        `in=${input},stream=audio,output=${path}${encrypted ? '' : ',skip_encryption=1'}`,
    ),
    '--protection_scheme',
    'cbcs',
    '--enable_raw_key_encryption',
    '--keys',
    `label=:key_id=${keyId}:key=${key}`,
    '--protection_systems',
    'CommonSystem',
    '--clear_lead',
    '0',
    '--segment_duration',
    fragmentSeconds,
    '--fragment_duration',
    fragmentSeconds,
  ]

  try {
    await runFfmpeg(args, { ffmpegPath: packagerPath(), timeoutMs, onLog })
  } finally {
    await Promise.all(scratch.map(({ input }) => fs.rm(input, { force: true })))
  }

  const indexed = []
  for (const { bitrate, path, encrypted } of outputs) {
    const handle = await fs.open(path, 'r')
    try {
      const stats = await handle.stat()
      const index = await buildFragmentIndexFromFile(handle, stats.size)
      indexed.push({ bitrate, path, size: stats.size, index, encrypted })
    } finally {
      await handle.close()
    }
  }

  assertAlignedRenditions(indexed)

  const [first] = indexed
  return {
    outputDir,
    timescale: first.index.timescale,
    durationTicks: first.index.durationTicks,
    renditions: indexed.map(({ bitrate, path, size, index, encrypted }) => ({
      bitrate,
      path,
      size,
      initRange: index.initRange,
      indexRange: index.indexRange,
      fragments: index.fragments,
      encryption: encrypted ? { scheme: 'cbcs', keyId } : null,
    })),
  }
}
