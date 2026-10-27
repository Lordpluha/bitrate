/**
 * Regenerates the CMAF fixture the streaming browser specs play: a short tone encoded by the
 * same `convertAudioToCmaf` the API's processing pipeline runs, at two bitrates, plus the
 * manifest in the shape `/tracks/{id}/manifest` serves (ADR-0020). Needs ffmpeg on PATH.
 *
 *   node scripts/make-cmaf-fixture.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { convertAudioToCmaf } from '@bitrate/converter'

const OUTPUT_DIR = resolve(import.meta.dirname, '../src/element/__fixtures__/cmaf')
const DURATION_SECONDS = 12
const BITRATES = [64, 192]
const CODEC = 'mp4a.40.2'
/** ~1 s fragments (AAC frames are 1024 samples at 48 kHz), so ABR has samples to react to. */
const FRAGMENT_FRAMES = 47

const workDir = mkdtempSync(join(tmpdir(), 'bitrate-cmaf-fixture-'))
const input = join(workDir, 'tone.wav')

try {
  execFileSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=440:duration=${DURATION_SECONDS}:sample_rate=48000`,
    '-ac',
    '2',
    input,
  ])

  rmSync(OUTPUT_DIR, { force: true, recursive: true })
  const result = await convertAudioToCmaf({
    input,
    outputDir: OUTPUT_DIR,
    bitrates: BITRATES,
    fragmentFrames: FRAGMENT_FRAMES,
  })

  const manifest = {
    version: 1,
    timescale: result.timescale,
    durationTicks: result.durationTicks,
    durationMs: Math.round((result.durationTicks / result.timescale) * 1000),
    renditions: result.renditions.map((rendition) => ({
      bitrate: rendition.bitrate,
      codec: CODEC,
      size: rendition.size,
      initRange: rendition.initRange,
      fragments: rendition.fragments.map((fragment) => [
        fragment.startTicks,
        fragment.durationTicks,
        fragment.offset,
        fragment.length,
      ]),
    })),
  }
  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify(manifest)}\n`)
  console.log(
    `wrote ${result.renditions.length} renditions and manifest.json to ${OUTPUT_DIR}:`,
    result.renditions.map((rendition) => `${rendition.bitrate}k ${rendition.path}`).join(', '),
  )
} finally {
  rmSync(workDir, { force: true, recursive: true })
}
