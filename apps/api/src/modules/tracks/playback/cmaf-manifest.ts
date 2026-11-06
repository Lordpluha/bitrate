import type { ManifestRendition, StoredRendition } from './track-playback.types'

/** Validates one persisted fragment tuple without trusting a JSON cast. */
function parseFragment(value: unknown, fileSize: number): [number, number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 4) return null

  const [startTicks, durationTicks, offset, length] = value
  if (
    ![startTicks, durationTicks, offset, length].every(Number.isSafeInteger) ||
    (startTicks as number) < 0 ||
    (durationTicks as number) <= 0 ||
    (offset as number) < 0 ||
    (length as number) <= 0 ||
    (offset as number) + (length as number) > fileSize
  ) {
    return null
  }

  return [startTicks as number, durationTicks as number, offset as number, length as number]
}

/** Reports whether fragments are contiguous in time and non-overlapping in bytes. */
function isContiguous(fragments: [number, number, number, number][]): boolean {
  return fragments.every((fragment, index) => {
    const previous = fragments[index - 1]
    if (!previous) return true
    return fragment[0] === previous[0] + previous[1] && fragment[2] >= previous[2] + previous[3]
  })
}

/**
 * Converts one database rendition into the strict public manifest shape.
 *
 * A row that fails any check is dropped rather than repaired: the player seeks
 * by byte offset, so a manifest that misdescribes the file is worse than a
 * missing rendition.
 *
 * @returns the rendition, or `null` when the stored row is not trustworthy.
 */
export function parseRendition(file: StoredRendition): ManifestRendition | null {
  if (
    !Number.isSafeInteger(file.bitrate) ||
    file.bitrate <= 0 ||
    !Number.isSafeInteger(file.size) ||
    (file.size ?? 0) <= 0 ||
    !Number.isSafeInteger(file.initRangeStart) ||
    !Number.isSafeInteger(file.initRangeEnd) ||
    (file.initRangeStart ?? -1) < 0 ||
    (file.initRangeEnd ?? -1) < (file.initRangeStart ?? 0) ||
    (file.initRangeEnd ?? 0) >= (file.size ?? 0) ||
    typeof file.codec !== 'string' ||
    file.codec.trim() === '' ||
    !Array.isArray(file.fragments) ||
    file.fragments.length === 0
  ) {
    return null
  }

  const fragments = file.fragments.map((fragment) => parseFragment(fragment, file.size as number))
  if (fragments.some((fragment) => fragment === null)) return null

  const parsedFragments = fragments as [number, number, number, number][]
  if (!isContiguous(parsedFragments)) return null

  return {
    bitrate: file.bitrate,
    codec: file.codec,
    size: file.size as number,
    initRange: [file.initRangeStart as number, file.initRangeEnd as number],
    fragments: parsedFragments,
  }
}
