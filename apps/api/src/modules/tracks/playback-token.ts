import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Mixed into every signature so a token signed with the same secret for another purpose — the
 * storage route's tokens — never verifies as a playback token.
 */
const SIGNATURE_DOMAIN = 'bitrate-playback.v1.'

/** Who may read which track, for which session. */
type PlaybackTokenClaims = {
  sessionId: string
  userId: string
  trackId: string
}

/** Claims plus the moment the token stops working. */
export type VerifiedPlaybackToken = PlaybackTokenClaims & { expiresAt: number }

/** Input for {@link createPlaybackToken}. */
export type CreatePlaybackTokenInput = PlaybackTokenClaims & { expiresInSeconds: number }

type PlaybackTokenPayload = { sid: string; uid: string; tid: string; exp: number }

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(`${SIGNATURE_DOMAIN}${data}`).digest('base64url')
}

function isPayload(value: unknown): value is PlaybackTokenPayload {
  if (typeof value !== 'object' || value === null) return false
  const { sid, uid, tid, exp } = value as Record<string, unknown>
  return (
    typeof sid === 'string' &&
    typeof uid === 'string' &&
    typeof tid === 'string' &&
    typeof exp === 'number' &&
    Number.isSafeInteger(exp)
  )
}

/**
 * Creates a compact HMAC-signed playback token, `<base64url(payload)>.<base64url(hmac)>`, that
 * authorises byte ranges of one track for one session (ADR-0065 stage 2).
 */
export function createPlaybackToken(
  { sessionId, userId, trackId, expiresInSeconds }: CreatePlaybackTokenInput,
  secret: string,
): string {
  const payload: PlaybackTokenPayload = {
    sid: sessionId,
    uid: userId,
    tid: trackId,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

/** Returns the token's claims, or `null` when it is malformed, forged or expired. */
export function verifyPlaybackToken(token: string, secret: string): VerifiedPlaybackToken | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, signature] = parts
  if (!(data && signature)) return null

  const expected = Buffer.from(sign(data, secret))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null

  let payload: unknown
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!isPayload(payload) || payload.exp <= Math.floor(Date.now() / 1000)) return null

  return {
    sessionId: payload.sid,
    userId: payload.uid,
    trackId: payload.tid,
    expiresAt: payload.exp,
  }
}
