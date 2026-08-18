import type {
  ManifestRendition,
  ResolvedFragment,
  TrackManifest,
} from '@/entities/Player/model/manifest.types'

export type FragmentAtInput = {
  manifest: TrackManifest
  rendition: ManifestRendition
  index: number
}

/** Converts a byte range from the manifest into an inclusive HTTP `Range` value. */
export const toRangeHeader = (range: readonly [number, number]) =>
  `bytes=${range[0]}-${range[1]}`

/**
 * Resolves one fragment of a rendition into seconds and an inclusive byte range.
 * Returns null when the index is outside the rendition.
 */
export const resolveFragment = ({
  manifest,
  rendition,
  index,
}: FragmentAtInput): ResolvedFragment | null => {
  const fragment = rendition.fragments[index]
  if (!fragment) return null

  const [startTicks, durationTicks, offset, length] = fragment

  return {
    index,
    bitrate: rendition.bitrate,
    startSeconds: startTicks / manifest.timescale,
    endSeconds: (startTicks + durationTicks) / manifest.timescale,
    byteRange: [offset, offset + length - 1],
  }
}

export type FindFragmentInput = {
  manifest: TrackManifest
  rendition: ManifestRendition
  timeSeconds: number
}

/**
 * Finds the fragment containing a point in time via binary search over the index.
 * This is what makes seeking one request instead of a scan through the file.
 */
export const findFragmentIndexAt = ({
  manifest,
  rendition,
  timeSeconds,
}: FindFragmentInput): number => {
  const target = Math.max(0, timeSeconds) * manifest.timescale
  const { fragments } = rendition

  if (fragments.length === 0) return -1

  let low = 0
  let high = fragments.length - 1

  while (low <= high) {
    const middle = (low + high) >> 1
    const candidate = fragments[middle]
    if (!candidate) break

    const [startTicks, durationTicks] = candidate

    if (target < startTicks) {
      high = middle - 1
      continue
    }

    if (target >= startTicks + durationTicks) {
      low = middle + 1
      continue
    }

    return middle
  }

  /** Past the end: clamp to the last fragment so playback finishes cleanly. */
  return Math.min(low, fragments.length - 1)
}

/** Picks the rendition for a bitrate, falling back to the lowest available one. */
export const selectRendition = (
  manifest: TrackManifest,
  bitrate: number,
): ManifestRendition | null =>
  manifest.renditions.find((rendition) => rendition.bitrate === bitrate) ??
  manifest.renditions[0] ??
  null

/** Seconds of media already buffered ahead of `currentTime`. */
export const getBufferedAhead = (
  buffered: TimeRanges,
  currentTime: number,
): number => {
  for (let index = 0; index < buffered.length; index += 1) {
    if (
      currentTime >= buffered.start(index) &&
      currentTime <= buffered.end(index)
    ) {
      return buffered.end(index) - currentTime
    }
  }

  return 0
}
