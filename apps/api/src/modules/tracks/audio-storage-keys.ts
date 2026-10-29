import { createHash } from 'node:crypto'

/** Length keeps object keys compact while retaining 64 bits of collision resistance. */
const GENERATION_HASH_LENGTH = 16

/** Returns an opaque, path-safe identifier for one immutable source upload. */
function getAudioGeneration(sourceFileName: string): string {
  return createHash('sha256').update(sourceFileName).digest('hex').slice(0, GENERATION_HASH_LENGTH)
}

/** Builds the immutable root used by every artifact generated from one source upload. */
export function getAudioGenerationRoot(trackId: string, sourceFileName: string): string {
  return `tracks/${trackId}/generations/${getAudioGeneration(sourceFileName)}`
}

/** Builds the object key of an uploaded master. Named by source file only, so it needs no stored key. */
export function getMasterKey(sourceFileName: string): string {
  return `masters/${sourceFileName}`
}
