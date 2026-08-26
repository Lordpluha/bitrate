import { extname } from 'node:path'
import { BadRequestException } from '@nestjs/common'

/** Supported output bitrates for transcoding (kbps). */
const TARGET_AUDIO_BITRATES = [128, 192, 320] as const

/** Covers are deliberately bounded independently from the larger audio upload. */
export const MAX_COVER_BYTES = 10 * 1024 * 1024

/** Below this the source is treated as unusable rather than transcoded further down. */
const MIN_SOURCE_BITRATE = 32

/** Only these HLS artifact names may be proxied out of storage. */
const HLS_ASSET_PATTERN = /^(index\.m3u8|init_\d+\.mp4|segment_\d{5}\.m4s)$/

/** Upload MIME types mapped to the container/codec pair they imply. */
const FORMAT_BY_MIME: Record<string, AudioFormat> = {
  'audio/mpeg': { format: 'mp3', codec: 'mp3' },
  'audio/ogg': { format: 'ogg', codec: null },
  'audio/wav': { format: 'wav', codec: null },
  'audio/webm': { format: 'webm', codec: null },
}

/** A resolved container/codec pair for a stored audio file. */
export type AudioFormat = { format: string; codec: string | null }

/** What is known about an upload before its format is resolved. */
export type ResolveAudioFormatInput = {
  fileName: string
  mimetype: string
  container: string | null
  codec: string | null
}

/** The subset of a `TrackFile` that quality selection actually reads. */
export type SelectableTrackFile = { format: string; bitrate: number }

/** Selection inputs for picking one rendition out of a track's stored files. */
export type SelectTrackFileInput<T extends SelectableTrackFile> = {
  files: T[]
  preferredBitrate?: number
  preferredFormat: string
}

/** An inclusive byte range resolved against a known file size. */
export type ByteRange = { start: number; end: number }

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

/** Resolves a stored container/codec pair, preferring probed metadata over the declared MIME. */
export function resolveAudioFormat({
  fileName,
  mimetype,
  container,
  codec,
}: ResolveAudioFormatInput): AudioFormat {
  const extension = extname(fileName).replace('.', '').toLowerCase()
  const fromMime = FORMAT_BY_MIME[mimetype]

  return {
    format: container ?? fromMime?.format ?? (extension || 'unknown'),
    codec: codec ?? fromMime?.codec ?? null,
  }
}

/** Returns a MIME type for a given filename extension. */
export function getContentType(fileName: string): string {
  switch (extname(fileName).replace('.', '').toLowerCase()) {
    case 'mp3':
      return 'audio/mpeg'
    case 'ogg':
    case 'opus':
      return 'audio/ogg'
    case 'wav':
      return 'audio/wav'
    case 'webm':
      return 'audio/webm'
    default:
      return 'application/octet-stream'
  }
}

/** Reports whether an HLS artifact name is one this API is willing to proxy. */
export function isAllowedHlsAsset(asset: string): boolean {
  return HLS_ASSET_PATTERN.test(asset)
}

/** Returns the MIME type for an HLS playlist, init segment, or media segment. */
export function getHlsAssetContentType(asset: string): string {
  if (asset.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl'
  return asset.endsWith('.mp4') ? 'video/mp4' : 'video/iso.segment'
}

/**
 * Picks the rendition closest to the requested quality without exceeding it.
 *
 * Files in the preferred format win outright; a request without a preference
 * gets the highest available rendition.
 */
export function selectPreferredTrackFile<T extends SelectableTrackFile>({
  files,
  preferredBitrate,
  preferredFormat,
}: SelectTrackFileInput<T>): T | undefined {
  const preferred = files.filter((file) => file.format === preferredFormat && file.bitrate > 0)
  const candidates = preferred.length > 0 ? preferred : files.filter((file) => file.bitrate > 0)
  const available = candidates.length > 0 ? candidates : files

  if (!preferredBitrate) return available.at(-1)

  return [...available].reverse().find((file) => file.bitrate <= preferredBitrate) ?? available[0]
}

/**
 * Parses an HTTP `Range` header into an inclusive byte range.
 *
 * @throws BadRequestException when the header is malformed or unsatisfiable.
 */
export function parseRangeHeader(range: string, fileSize: number): ByteRange {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) throw new BadRequestException('Invalid Range header')

  const [, startText = '', endText = ''] = match
  if (!(startText || endText)) throw new BadRequestException('Invalid Range header')

  const suffixOnly = !startText && endText
  const start = suffixOnly
    ? Math.max(0, fileSize - Number.parseInt(endText, 10))
    : Number.parseInt(startText, 10)
  const requestedEnd = startText && endText ? Number.parseInt(endText, 10) : fileSize - 1
  const end = Math.min(suffixOnly ? fileSize - 1 : requestedEnd, fileSize - 1)

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
    throw new BadRequestException('Invalid Range header')
  }

  return { start, end }
}
