import { join } from 'node:path'
import { CMAF_FORMAT, type PreparedCmafPackage } from './audio-artifact.types'

/** Every FFmpeg pass is abandoned after ten minutes. */
const CONVERSION_TIMEOUT_MS = 600_000

/** Parses a `192k`-style bitrate label into kbps. */
function parseBitrateLabel(bitrate: string): number {
  const value = Number(bitrate.replace(/k$/, ''))
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid audio bitrate: ${bitrate}`)
  return value
}

/**
 * Encodes one CMAF file per bitrate in a single FFmpeg run and reads back the
 * byte index the player needs for Range playback.
 *
 * The converter fails the job when renditions do not share fragment boundaries,
 * so an unspliceable track never reaches READY. See ADR-0020 and ADR-0065.
 */
export async function generateCmaf(
  generationRoot: string,
  inputPath: string,
  temporaryRoot: string,
  bitrates: string[],
): Promise<PreparedCmafPackage> {
  const { convertAudioToCmaf } = await import('@bitrate/converter')

  const result = await convertAudioToCmaf({
    input: inputPath,
    outputDir: join(temporaryRoot, CMAF_FORMAT),
    bitrates: bitrates.map(parseBitrateLabel),
    timeoutMs: CONVERSION_TIMEOUT_MS,
  })

  return {
    timescale: result.timescale,
    durationTicks: result.durationTicks,
    renditions: result.renditions.map((rendition) => ({
      bitrate: rendition.bitrate,
      audioKey: `${generationRoot}/cmaf/${rendition.bitrate}.m4a`,
      temporaryPath: rendition.path,
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
}
