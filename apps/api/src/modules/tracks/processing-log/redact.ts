/** Which end of an over-limit string survives truncation. */
export type RedactKeep = 'head' | 'tail'

/** Options for `redactProcessingText`. */
export type RedactProcessingTextOptions = {
  keep: RedactKeep
  maxBytes: number
}

/**
 * Collapses an absolute filesystem path up to and including a `tracks/` or `.processing/`
 * segment to `<tracks>/…`, so a redacted string never leaks the storage root or a temp
 * directory layout.
 */
const PATH_SEGMENT_PATTERN = /(?:\/[^\s/"']+)*\/(?:tracks|\.processing)\//g

/** A URL whose query string carries a presigned-request signature. */
const PRESIGNED_URL_PATTERN = /https?:\/\/[^\s"']+/gi

/** Query markers that identify a presigned URL rather than an ordinary link. */
const PRESIGNED_URL_MARKER_PATTERN = /X-Amz-|Signature=/

/** `KEY=value` pairs whose key name suggests a credential. */
const SECRET_KEY_VALUE_PATTERN =
  /\b((?:AWS|S3)_[A-Z0-9_]*|[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD)[A-Z0-9_]*)=\S+/g

/** Truncates `text` to at most `maxBytes` UTF-8 bytes, keeping the requested end. */
function truncateToBytes(text: string, maxBytes: number, keep: RedactKeep): string {
  if (Buffer.byteLength(text, 'utf8') <= maxBytes) return text

  const buffer = Buffer.from(text, 'utf8')
  const slice =
    keep === 'head' ? buffer.subarray(0, maxBytes) : buffer.subarray(buffer.length - maxBytes)

  return slice.toString('utf8')
}

/**
 * Redacts filesystem paths, presigned-URL query strings and credential-shaped
 * `KEY=value` pairs from a processing-log text field, then truncates it to `maxBytes`.
 *
 * Idempotent: redacting an already-redacted string is a no-op beyond truncation, so the
 * recorder and the consumer can each call it independently without compounding markers.
 */
export function redactProcessingText(
  text: string,
  { keep, maxBytes }: RedactProcessingTextOptions,
): string {
  // URLs first: a presigned URL's own `//host/tracks/...` path would otherwise be eaten by
  // the path pattern below, corrupting the `https://` scheme before the marker check runs.
  const withoutUrls = text.replace(PRESIGNED_URL_PATTERN, (match) =>
    PRESIGNED_URL_MARKER_PATTERN.test(match) ? '<presigned-url host>' : match,
  )
  const withoutPaths = withoutUrls.replace(PATH_SEGMENT_PATTERN, '<tracks>/')
  const withoutSecrets = withoutPaths.replace(SECRET_KEY_VALUE_PATTERN, '$1=<redacted>')

  return truncateToBytes(withoutSecrets, maxBytes, keep)
}
