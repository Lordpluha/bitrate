import { createHmac, timingSafeEqual } from 'node:crypto'

/** Payload embedded in a signed local-storage object token. */
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
 * Format: `<base64url(payload)>.<base64url(hmac)>` — the local-driver equivalent
 * of an S3 presigned URL's signed query string.
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
