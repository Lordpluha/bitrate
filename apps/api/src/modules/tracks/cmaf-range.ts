import { type ResolvedRange, UnsatisfiableRangeError } from './track-playback.types'

/**
 * Parses a single-window `bytes=` Range header against a known file size.
 * Invalid and unsatisfiable ranges throw so the controller can emit an RFC 9110
 * 416 response with the required wildcard `Content-Range` value.
 */
export function resolveRange(rangeHeader: string | undefined, fileSize: number): ResolvedRange {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    throw new UnsatisfiableRangeError(Math.max(0, fileSize))
  }

  const whole: ResolvedRange = {
    start: 0,
    end: fileSize - 1,
    contentLength: fileSize,
    isPartial: false,
  }

  if (!rangeHeader) return whole

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!match) throw new UnsatisfiableRangeError(fileSize)

  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') throw new UnsatisfiableRangeError(fileSize)

  let start: number
  let end: number

  if (rawStart === '') {
    /** Suffix form `bytes=-N`: the last N bytes. */
    const suffixLength = Number(rawEnd)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      throw new UnsatisfiableRangeError(fileSize)
    }
    start = Math.max(0, fileSize - suffixLength)
    end = fileSize - 1
  } else {
    start = Number(rawStart)
    end = rawEnd === '' ? fileSize - 1 : Number(rawEnd)
  }

  if (!(Number.isSafeInteger(start) && Number.isSafeInteger(end))) {
    throw new UnsatisfiableRangeError(fileSize)
  }
  if (start < 0 || end < 0 || start >= fileSize || start > end) {
    throw new UnsatisfiableRangeError(fileSize)
  }

  end = Math.min(end, fileSize - 1)

  return { start, end, contentLength: end - start + 1, isPartial: true }
}
