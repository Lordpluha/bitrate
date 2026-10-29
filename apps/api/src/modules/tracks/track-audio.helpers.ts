import { BadRequestException } from '@nestjs/common'

/** Supported output bitrates for transcoding (kbps). */
const TARGET_AUDIO_BITRATES = [128, 192, 320] as const

/** Covers are deliberately bounded independently from the larger audio upload. */
export const MAX_COVER_BYTES = 10 * 1024 * 1024

/** Below this the source is treated as unusable rather than transcoded further down. */
const MIN_SOURCE_BITRATE = 32

/**
 * Returns the target bitrate strings derived from the source bitrate.
 *
 * An unknown (zero) source bitrate falls back to the full ladder; a source
 * quieter than every rung is transcoded at its own bitrate rather than upscaled.
 *
 * @throws BadRequestException when the source is below the usable floor.
 */
export function getTargetBitrates(sourceBitrate: number): string[] {
  if (sourceBitrate <= 0) return TARGET_AUDIO_BITRATES.map((bitrate) => `${bitrate}k`)

  if (sourceBitrate < MIN_SOURCE_BITRATE) {
    throw new BadRequestException(
      `Source audio bitrate must be at least ${MIN_SOURCE_BITRATE} kbps`,
    )
  }

  const bitrates = TARGET_AUDIO_BITRATES.filter((bitrate) => bitrate <= sourceBitrate)
  return bitrates.length > 0 ? bitrates.map((bitrate) => `${bitrate}k`) : [`${sourceBitrate}k`]
}
