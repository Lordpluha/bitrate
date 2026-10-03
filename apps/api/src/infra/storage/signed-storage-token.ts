import { createHmac, timingSafeEqual } from 'node:crypto'

/** Payload embedded in a signed storage object token. */
type SignedStorageTokenPayload = {
  key: string
  expires: number
}

/** Computes the HMAC-SHA256 signature (base64url) for a signed-token data segment. */
function computeSignature(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

/**
 * Creates a compact, time-limited, HMAC-signed token embedding a storage key.
 * Format: `<base64url(payload)>.<base64url(hmac)>` — the token behind the API's own
 * storage route, used instead of an S3 presigned URL.
 */
export function createSignedStorageToken(
  key: string,
  expiresInSeconds: number,
  secret: string,
): string {
  const payload: SignedStorageTokenPayload = {
    key,
    expires: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${computeSignature(data, secret)}`
}

/** Verifies a signed storage token, returning its key, or `null` if invalid/expired. */
export function verifySignedStorageToken(token: string, secret: string): string | null {
  const [data, signature] = token.split('.')
  if (!(data && signature)) return null

  const expectedSignature = computeSignature(data, secret)
  const expectedBuffer = Buffer.from(expectedSignature)
  const providedBuffer = Buffer.from(signature)
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString(),
    ) as Partial<SignedStorageTokenPayload>
    if (typeof payload.key !== 'string' || typeof payload.expires !== 'number') return null
    if (payload.expires < Math.floor(Date.now() / 1000)) return null
    return payload.key
  } catch {
    return null
  }
}

/**
 * Builds the browser-facing URL for an object: a signed token route on this API.
 * Both storage drivers use it, so the object store's own endpoint never reaches a browser.
 */
export function createSignedStorageUrl(
  key: string,
  expiresInSeconds: number,
  secret: string,
  apiBaseUrl: string,
): string {
  const token = createSignedStorageToken(key, expiresInSeconds, secret)
  return `${apiBaseUrl}/api/v1/storage/objects/${encodeURIComponent(token)}`
}
