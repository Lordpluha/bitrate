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

type FindSeekFragmentInput = FindFragmentInput & {
  buffered: TimeRanges
}

const BUFFERED_TIME_TOLERANCE_SECONDS = 0.01

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

const getBufferedRangeEndAt = (buffered: TimeRanges, timeSeconds: number) => {
  for (let index = 0; index < buffered.length; index += 1) {
    if (
      timeSeconds >= buffered.start(index) &&
      timeSeconds <= buffered.end(index)
    ) {
      return buffered.end(index)
    }
  }

  return null
}

/** True when one retained MSE range covers the complete fragment timeline. */
export const isTimeRangeBuffered = (
  buffered: TimeRanges,
  startSeconds: number,
  endSeconds: number,
) => {
  for (let index = 0; index < buffered.length; index += 1) {
    if (
      buffered.start(index) <= startSeconds + BUFFERED_TIME_TOLERANCE_SECONDS &&
      buffered.end(index) >= endSeconds - BUFFERED_TIME_TOLERANCE_SECONDS
    ) {
      return true
    }
  }

  return false
}

/**
 * Returns the first fragment not already covered by the retained seek range.
 * Seeking inside the buffer must not rewind the network head and append the
 * same media timestamps again.
 */
export const findFragmentIndexForSeek = ({
  buffered,
  manifest,
  rendition,
  timeSeconds,
}: FindSeekFragmentInput): number => {
  const targetIndex = findFragmentIndexAt({
    manifest,
    rendition,
    timeSeconds,
  })
  if (
    targetIndex < 0 ||
    getBufferedRangeEndAt(buffered, timeSeconds) === null
  ) {
    return targetIndex
  }

  for (
    let index = targetIndex;
    index < rendition.fragments.length;
    index += 1
  ) {
    const fragment = resolveFragment({ index, manifest, rendition })
    if (
      !fragment ||
      !isTimeRangeBuffered(buffered, fragment.startSeconds, fragment.endSeconds)
    ) {
      return index
    }
  }

  return rendition.fragments.length
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
