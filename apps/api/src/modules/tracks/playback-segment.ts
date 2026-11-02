import {
  type ManifestRendition,
  type ResolvedRange,
  UnsatisfiableRangeError,
} from './track-playback.types'

/** One contiguous byte span of a rendition file and the audio it holds, in milliseconds. */
export type RenditionSegment = {
  start: number
  end: number
  audioMs: number
}

/**
 * How one rendition request is answered (ADR-0067, D15):
 * - `exact` — a range no longer than the rendition's largest fragment (~10 s), served as asked
 *   and charged up front; this is every request the MSE loader makes;
 * - `paced` — a missing or oversized range, served to the end of the file but released no
 *   faster than the session's real-time budget, so a native `<audio>` still gets the one long
 *   response it expects while the track cannot be fetched whole at once.
 */
export type RenditionResponsePlan =
  | (ResolvedRange & { kind: 'exact'; audioMs: number })
  | (ResolvedRange & { kind: 'paced' })

/**
 * Splits a rendition file into its spans, in byte order: the init segment, each fragment, and the
 * gaps between them (the `sidx` after the init segment, the trailing `mfra`). Only fragments carry
 * audio time.
 */
export function renditionSegments(
  rendition: ManifestRendition,
  timescale: number,
): RenditionSegment[] {
  const segments: RenditionSegment[] = []
  const [initStart, initEnd] = rendition.initRange
  segments.push({ start: initStart, end: initEnd, audioMs: 0 })

  let cursor = initEnd + 1
  for (const [, durationTicks, offset, length] of rendition.fragments) {
    if (offset > cursor) segments.push({ start: cursor, end: offset - 1, audioMs: 0 })
    segments.push({
      start: offset,
      end: offset + length - 1,
      audioMs: Math.round((durationTicks * 1000) / timescale),
    })
    cursor = offset + length
  }
  if (cursor < rendition.size) segments.push({ start: cursor, end: rendition.size - 1, audioMs: 0 })
  return segments
}

/** Audio held by bytes `start`..`end` (inclusive), counting partial fragments by their bytes. */
export function audioMsBetween(segments: RenditionSegment[], start: number, end: number): number {
  let audioMs = 0
  for (const segment of segments) {
    const overlapStart = Math.max(start, segment.start)
    const overlapEnd = Math.min(end, segment.end)
    if (overlapStart > overlapEnd || segment.audioMs === 0) continue
    const segmentBytes = segment.end - segment.start + 1
    audioMs += (segment.audioMs * (overlapEnd - overlapStart + 1)) / segmentBytes
  }
  return Math.round(audioMs)
}

/**
 * Decides how a requested range is answered; see {@link RenditionResponsePlan}.
 * @throws UnsatisfiableRangeError when the first byte lies outside the file.
 */
export function planRenditionResponse(
  range: ResolvedRange,
  segments: RenditionSegment[],
): RenditionResponsePlan {
  const fileSize = (segments.at(-1)?.end ?? -1) + 1
  if (range.start >= fileSize) throw new UnsatisfiableRangeError(fileSize)

  const largestFragment = Math.max(
    0,
    ...segments.filter(({ audioMs }) => audioMs > 0).map(({ start, end }) => end - start + 1),
  )
  if (range.isPartial && range.contentLength <= largestFragment) {
    return { kind: 'exact', ...range, audioMs: audioMsBetween(segments, range.start, range.end) }
  }

  const end = fileSize - 1
  return {
    kind: 'paced',
    start: range.start,
    end,
    contentLength: end - range.start + 1,
    isPartial: true,
  }
}
