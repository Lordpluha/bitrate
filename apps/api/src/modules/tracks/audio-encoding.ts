import { access, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { ConvertAudioJob } from '@infra/queues/audio-processing.queue'
import type { Job } from 'bullmq'
import { CMAF_FORMAT, type PreparedCmafPackage, type PreparedVariant } from './audio-artifact.types'
import { getAudioGenerationRoot } from './audio-storage-keys'

/** Every FFmpeg pass is abandoned after ten minutes. */
const CONVERSION_TIMEOUT_MS = 600_000

/** Progressive encoding owns the first 90% of the job's reported progress. */
const PROGRESSIVE_PROGRESS_SHARE = 90

/** HLS segments are cut at four seconds so a rung switch is never far away. */
const HLS_SEGMENT_SECONDS = 4

/** Parses a `192k`-style bitrate label into kbps. */
function parseBitrateLabel(bitrate: string): number {
  const value = Number(bitrate.replace(/k$/, ''))
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid audio bitrate: ${bitrate}`)
  return value
}

/** Validates that a progressive Opus variant is non-empty. */
async function validateAudioVariant(audioPath: string): Promise<void> {
  const audioStats = await stat(audioPath)
  if (audioStats.size <= 0) throw new Error(`Converted audio file is empty: ${audioPath}`)
}

/** Encodes progressive Opus fallback files for every requested bitrate. */
export async function prepareVariants(
  job: Job<ConvertAudioJob>,
  temporaryRoot: string,
): Promise<PreparedVariant[]> {
  const { inputPath, format, bitrates, sourceFileName, trackId } = job.data
  const { convertAudio } = await import('@spotify/converter')
  const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)
  const prepared: PreparedVariant[] = []

  for (const [index, bitrate] of bitrates.entries()) {
    const bitrateValue = parseBitrateLabel(bitrate)
    const temporaryAudioPath = join(temporaryRoot, `audio_${bitrate}.${format}`)

    await convertAudio({
      input: inputPath,
      output: temporaryAudioPath,
      bitrate,
      vbr: false,
      quality: 10,
      application: 'audio',
      timeoutMs: CONVERSION_TIMEOUT_MS,
    })
    await validateAudioVariant(temporaryAudioPath)

    const fileStat = await stat(temporaryAudioPath)
    prepared.push({
      bitrate: bitrateValue,
      codec: format === 'opus' ? 'opus' : null,
      audioKey: `${generationRoot}/audio/${bitrate}.${format}`,
      temporaryAudioPath,
      size: fileStat.size,
    })
    await job.updateProgress(
      Math.round(((index + 1) / bitrates.length) * PROGRESSIVE_PROGRESS_SHARE),
    )
  }

  return prepared
}

/** Generates a multi-bitrate HLS package from the original source file. */
export async function generateHls(
  job: Job<ConvertAudioJob>,
  temporaryHlsPath: string,
  bitrates: string[],
): Promise<void> {
  const { convertAudioToHls } = await import('@spotify/converter')
  await convertAudioToHls({
    input: job.data.inputPath,
    outputDir: temporaryHlsPath,
    bitrates,
    segmentDuration: HLS_SEGMENT_SECONDS,
    timeoutMs: CONVERSION_TIMEOUT_MS,
  })
}

/** Validates the master playlist and every bitrate rendition. */
export async function validateHls(hlsPath: string, bitrates: string[]): Promise<void> {
  await access(join(hlsPath, 'master.m3u8'))

  for (const bitrate of bitrates) {
    const variantPath = join(hlsPath, bitrate.replace(/k$/, ''))
    await access(join(variantPath, 'index.m3u8'))

    const assets = await readdir(variantPath)
    if (!assets.some((asset) => /^init_\d+\.mp4$/.test(asset))) {
      throw new Error(`HLS playlist has no initialization segment: ${variantPath}`)
    }
    if (!assets.some((asset) => /^segment_\d{5}\.m4s$/.test(asset))) {
      throw new Error(`HLS playlist has no media segments: ${variantPath}`)
    }
  }
}

/**
 * Encodes one CMAF file per bitrate in a single FFmpeg run and reads back the
 * byte index the player needs for Range playback.
 *
 * The converter fails the job when renditions do not share fragment boundaries,
 * so an unspliceable track never reaches READY. See ADR-0020.
 */
export async function generateCmaf(
  generationRoot: string,
  job: Job<ConvertAudioJob>,
  temporaryRoot: string,
  bitrates: string[],
): Promise<PreparedCmafPackage> {
  const { convertAudioToCmaf } = await import('@spotify/converter')

  const result = await convertAudioToCmaf({
    input: job.data.inputPath,
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
