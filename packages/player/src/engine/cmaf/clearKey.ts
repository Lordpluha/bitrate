/** The W3C Clear Key key system (ADR-0077 Phase A). */
const CLEAR_KEY = 'org.w3.clearkey'

/** ClearKey with `cbcs` audio — the scheme every Bitrate encrypted rendition uses. */
const CLEAR_KEY_CBCS: MediaKeySystemConfiguration[] = [
  {
    initDataTypes: ['keyids', 'cenc'],
    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"', encryptionScheme: 'cbcs' }],
    sessionTypes: ['temporary'],
  },
]

/** `navigator.requestMediaKeySystemAccess`, injected so the engine reads no host global. */
export type RequestKeySystemAccess = (
  keySystem: string,
  configs: MediaKeySystemConfiguration[],
) => Promise<MediaKeySystemAccess>

/** The browser's `requestMediaKeySystemAccess`, read when called; `undefined` without EME. */
export function browserKeySystemAccess(): RequestKeySystemAccess | undefined {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.requestMediaKeySystemAccess !== 'function'
  ) {
    return undefined
  }
  return navigator.requestMediaKeySystemAccess.bind(navigator)
}

/**
 * Resolves ClearKey `cbcs` access, or `null` when the browser has no EME, no ClearKey (WebKit) or
 * no `cbcs` for it — the caller then plays clear renditions.
 */
export async function probeClearKeyCbcs(
  request: RequestKeySystemAccess | undefined,
): Promise<MediaKeySystemAccess | null> {
  if (!request) return null
  try {
    return await request(CLEAR_KEY, CLEAR_KEY_CBCS)
  } catch {
    return null
  }
}

/** `{"kids":["<base64url>"]}` — the `keyids` init data naming one 128-bit hex key id. */
export function keyIdsInitData(keyId: string): Uint8Array<ArrayBuffer> {
  const bytes = keyId.match(/../g)?.map((pair) => Number.parseInt(pair, 16)) ?? []
  const base64 = btoa(String.fromCharCode(...bytes))
  const kid = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  /** Copied into a fresh `ArrayBuffer`-backed array, the `BufferSource` EME accepts. */
  return new Uint8Array(new TextEncoder().encode(JSON.stringify({ kids: [kid] })))
}

/** One `MediaKeys` per media element: slots reuse their element across tracks. */
const keysByMedia = new WeakMap<object, Promise<MediaKeys>>()

function mediaKeysFor(media: HTMLMediaElement, access: MediaKeySystemAccess): Promise<MediaKeys> {
  let keys = keysByMedia.get(media)
  if (!keys) {
    keys = access.createMediaKeys().then(async (created) => {
      await media.setMediaKeys(created)
      return created
    })
    keysByMedia.set(media, keys)
    keys.catch(() => keysByMedia.delete(media))
  }
  return keys
}

/** Input for {@link startClearKeySession}. */
export type StartClearKeySessionInput = {
  media: HTMLMediaElement
  access: MediaKeySystemAccess
  /** The track's key id from the manifest, 128-bit lowercase hex. */
  keyId: string
  /** Sends the CDM's licence request to the host and returns the licence. */
  requestLicense: (message: ArrayBuffer) => Promise<ArrayBuffer>
}

/**
 * Opens a ClearKey session for one track and resolves once its licence is applied. The request
 * is generated from the manifest's key id up front, so the licence round trip runs alongside
 * MediaSource setup instead of waiting for the CDM to find `pssh` in the init segment.
 * @throws when the CDM or the host's licence request fails; the session is closed then.
 */
export async function startClearKeySession({
  media,
  access,
  keyId,
  requestLicense,
}: StartClearKeySessionInput): Promise<MediaKeySession> {
  const keys = await mediaKeysFor(media, access)
  const session = keys.createSession('temporary')

  const licensed = new Promise<void>((resolve, reject) => {
    session.addEventListener(
      'message',
      (event) => {
        const { message } = event as MediaKeyMessageEvent
        requestLicense(message)
          .then((licence) => session.update(licence))
          .then(resolve, reject)
      },
      { once: true },
    )
  })

  try {
    await session.generateRequest('keyids', keyIdsInitData(keyId))
    await licensed
    return session
  } catch (error) {
    await session.close().catch(() => undefined)
    throw error
  }
}
