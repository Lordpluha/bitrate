import { createHash } from 'node:crypto'

/** Length keeps object keys compact while retaining 64 bits of collision resistance. */
const GENERATION_HASH_LENGTH = 16

/** Returns an opaque, path-safe identifier for one immutable source upload. */
export function getAudioGeneration(sourceFileName: string): string {
  return createHash('sha256').update(sourceFileName).digest('hex').slice(0, GENERATION_HASH_LENGTH)
}

/** Builds the immutable root used by every artifact generated from one source upload. */
export function getAudioGenerationRoot(trackId: string, sourceFileName: string): string {
  return `tracks/${trackId}/generations/${getAudioGeneration(sourceFileName)}`
}

/**
 * Resolves the HLS root associated with a TrackFile URL.
 *
 * The legacy fallback preserves already-processed tracks whose files predate
 * generation-scoped object keys.
 */
export function getHlsRootFromAudioUrl(trackId: string, audioUrl: string): string {
  const audioMarker = '/audio/'
  const markerIndex = audioUrl.indexOf(audioMarker)
  const expectedPrefix = `tracks/${trackId}/generations/`

  if (markerIndex > 0) {
    const generationRoot = audioUrl.slice(0, markerIndex)
    if (generationRoot.startsWith(expectedPrefix)) return `${generationRoot}/hls`
  }

  return `tracks/${trackId}/hls`
}
