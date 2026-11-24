import { join } from 'node:path'
import { generateContentKey } from '../encryption/generate-content-key'
import { wrapContentKey } from '../encryption/wrap-content-key'
import { CMAF_FORMAT, type PreparedCmafPackage } from './audio-artifact.types'

/** Every FFmpeg or packager pass is abandoned after ten minutes. */
const CONVERSION_TIMEOUT_MS = 600_000

/** Parses a `192k`-style bitrate label into kbps. */
function parseBitrateLabel(bitrate: string): number {
  const value = Number(bitrate.replace(/k$/, ''))
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid audio bitrate: ${bitrate}`)
  return value
}

/** One converter rendition, clear or encrypted, as both converter steps return it. */
type ConvertedRendition = {
  bitrate: number
  path: string
  size: number
  initRange: [number, number]
  fragments: { startTicks: number; durationTicks: number; offset: number; length: number }[]
  encryption?: { scheme: 'cbcs'; keyId: string } | null
}

/** Input for {@link generateCmaf}. */
export type GenerateCmafInput = {
  generationRoot: string
  inputPath: string
  temporaryRoot: string
  bitrates: string[]
  /** `PLAYBACK_KEY_ENCRYPTION_KEY`; unset leaves the renditions unencrypted. */
  keyEncryptionKey?: string
}

/** Maps converter output to upload-ready renditions under the generation root. */
function prepare(generationRoot: string, renditions: ConvertedRendition[]) {
  return renditions.map((rendition) => {
    const encrypted = Boolean(rendition.encryption)
    const suffix = rendition.encryption === null ? '-clear' : ''
    return {
      bitrate: rendition.bitrate,
      encrypted,
      audioKey: `${generationRoot}/cmaf/${rendition.bitrate}${suffix}.m4a`,
      temporaryPath: rendition.path,
      size: rendition.size,
      initRange: rendition.initRange,
      fragments: rendition.fragments.map((fragment) => [
        fragment.startTicks,
        fragment.durationTicks,
        fragment.offset,
        fragment.length,
      ]),
    }
  })
}

/**
 * Encodes one CMAF file per bitrate in a single FFmpeg run and reads back the byte index the
 * player needs for Range playback (ADR-0020, ADR-0065). With a key-encryption key, every
 * rendition is then encrypted with CENC `cbcs` under a fresh content key and the lowest bitrate
 * is also kept unencrypted on the same grid for clients without ClearKey `cbcs` (ADR-0077).
 *
 * The converter fails the job when renditions do not share fragment boundaries, so an
 * unspliceable track never reaches READY.
 */
export async function generateCmaf({
  generationRoot,
  inputPath,
  temporaryRoot,
  bitrates,
  keyEncryptionKey,
}: GenerateCmafInput): Promise<PreparedCmafPackage> {
  const { convertAudioToCmaf } = await import('@bitrate/converter')

  const clear = await convertAudioToCmaf({
    input: inputPath,
    outputDir: join(temporaryRoot, CMAF_FORMAT),
    bitrates: bitrates.map(parseBitrateLabel),
    timeoutMs: CONVERSION_TIMEOUT_MS,
  })

  if (!keyEncryptionKey) {
    return {
      timescale: clear.timescale,
      durationTicks: clear.durationTicks,
      renditions: prepare(generationRoot, clear.renditions),
      contentKey: null,
    }
  }

  const { encryptCmafRenditions } = await import('@bitrate/converter/cmaf-encrypt')
  const content = generateContentKey()
  const lowest = Math.min(...clear.renditions.map((rendition) => rendition.bitrate))
  const encrypted = await encryptCmafRenditions({
    renditions: clear.renditions,
    outputDir: join(temporaryRoot, `${CMAF_FORMAT}-encrypted`),
    keyId: content.keyId,
    key: content.key,
    clearBitrates: [lowest],
    timeoutMs: CONVERSION_TIMEOUT_MS,
  })

  return {
    timescale: encrypted.timescale,
    durationTicks: encrypted.durationTicks,
    renditions: prepare(generationRoot, encrypted.renditions),
    contentKey: { keyId: content.keyId, ...wrapContentKey(content, keyEncryptionKey) },
  }
}
