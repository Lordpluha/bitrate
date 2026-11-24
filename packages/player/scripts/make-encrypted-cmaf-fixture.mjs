/**
 * Regenerates the encrypted CMAF fixture (ADR-0077): the tone of `make-cmaf-fixture.mjs`, encoded
 * and then encrypted by the same converter steps the API's worker runs — 192 kbps `cbcs` under a
 * fixed test key, plus a clear 64 kbps copy on the same grid — and the manifest with each
 * rendition's encryption. The key is a fixture value, not a secret. Needs ffmpeg on PATH.
 *
 *   node scripts/make-encrypted-cmaf-fixture.mjs
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { convertAudioToCmaf } from '@bitrate/converter'
import { encryptCmafRenditions } from '@bitrate/converter/cmaf-encrypt'

const OUTPUT_DIR = resolve(import.meta.dirname, '../src/element/__fixtures__/cmaf-encrypted')
/** Fixture key and key id, also used by `cmaf-encrypted.browser-spec.ts`. */
const KEY_ID = '0123456789abcdef0123456789abcdef'
const KEY = 'fedcba9876543210fedcba9876543210'
const DURATION_SECONDS = 12
const CODEC = 'mp4a.40.2'
const FRAGMENT_FRAMES = 47

const workDir = mkdtempSync(join(tmpdir(), 'bitrate-cmaf-encrypted-fixture-'))
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

  const clear = await convertAudioToCmaf({
    input,
    outputDir: join(workDir, 'clear'),
    bitrates: [64, 192],
    fragmentFrames: FRAGMENT_FRAMES,
  })
  const encrypted = await encryptCmafRenditions({
    renditions: clear.renditions.filter((rendition) => rendition.bitrate === 192),
    outputDir: join(workDir, 'encrypted'),
    keyId: KEY_ID,
    key: KEY,
    fragmentFrames: FRAGMENT_FRAMES,
  })
  const clearCopy = await encryptCmafRenditions({
    renditions: clear.renditions.filter((rendition) => rendition.bitrate === 64),
    outputDir: join(workDir, 'clear-copy'),
    keyId: KEY_ID,
    key: KEY,
    clearBitrates: [64],
    fragmentFrames: FRAGMENT_FRAMES,
  })
  const renditions = [
    ...clearCopy.renditions.filter((rendition) => rendition.encryption === null),
    ...encrypted.renditions,
  ]

  rmSync(OUTPUT_DIR, { force: true, recursive: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })
  for (const rendition of renditions) {
    copyFileSync(rendition.path, join(OUTPUT_DIR, `${rendition.bitrate}.m4a`))
  }

  const manifest = {
    version: 1,
    timescale: encrypted.timescale,
    durationTicks: encrypted.durationTicks,
    durationMs: Math.round((encrypted.durationTicks / encrypted.timescale) * 1000),
    renditions: renditions.map((rendition) => ({
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
      encryption: rendition.encryption,
    })),
  }
  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify(manifest)}\n`)
  console.log(`wrote ${renditions.map((r) => `${r.bitrate}k`).join(', ')} to ${OUTPUT_DIR}`)
} finally {
  rmSync(workDir, { force: true, recursive: true })
}
