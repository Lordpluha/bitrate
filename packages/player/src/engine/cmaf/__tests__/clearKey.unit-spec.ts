import { describe, expect, it, vi } from 'vitest'
import { keyIdsInitData, probeClearKeyCbcs, startClearKeySession } from '../clearKey'

const KEY_ID = '0123456789abcdef0123456789abcdef'
const KID_B64URL = 'ASNFZ4mrze8BI0VniavN7w'

/** A CDM stand-in: sessions emit one licence request per `generateRequest`. */
const fakeKeys = () => {
  const sessions: FakeSession[] = []
  const keys = {
    createSession: vi.fn(() => {
      const session = new FakeSession()
      sessions.push(session)
      return session
    }),
  }
  return { keys, sessions }
}

class FakeSession extends EventTarget {
  update = vi.fn(async (_licence: ArrayBuffer) => undefined)
  close = vi.fn(async () => undefined)
  generateRequest = vi.fn(async (_type: string, initData: ArrayBuffer | Uint8Array) => {
    const message = new Event('message') as Event & { message: ArrayBuffer | Uint8Array }
    /** A ClearKey CDM's request names the same key ids as the `keyids` init data. */
    message.message = initData
    queueMicrotask(() => this.dispatchEvent(message))
  })
}

const fakeAccess = (keys: unknown) => ({
  keySystem: 'org.w3.clearkey',
  createMediaKeys: vi.fn(async () => keys),
})

const fakeMedia = () => ({ setMediaKeys: vi.fn(async () => undefined) })

describe('ClearKey (ADR-0077)', () => {
  it('encodes the key id as keyids init data with base64url kids', () => {
    const json = JSON.parse(Buffer.from(keyIdsInitData(KEY_ID)).toString('utf8'))

    expect(json).toEqual({ kids: [KID_B64URL] })
  })

  it('asks for ClearKey with cbcs audio and reports a missing key system as null', async () => {
    const access = { keySystem: 'org.w3.clearkey' }
    const request = vi.fn(async () => access)

    await expect(probeClearKeyCbcs(request as never)).resolves.toBe(access)
    const [keySystem, [config]] = request.mock.calls[0] as unknown as [
      string,
      MediaKeySystemConfiguration[],
    ]
    expect(keySystem).toBe('org.w3.clearkey')
    expect(config?.audioCapabilities?.[0]).toMatchObject({ encryptionScheme: 'cbcs' })

    const refused = vi.fn(async () => {
      throw new DOMException('unsupported', 'NotSupportedError')
    })
    await expect(probeClearKeyCbcs(refused as never)).resolves.toBeNull()
    await expect(probeClearKeyCbcs(undefined)).resolves.toBeNull()
  })

  it('sends the CDM request to the host and applies the licence it returns', async () => {
    const { keys, sessions } = fakeKeys()
    const licence = new TextEncoder().encode('{"keys":[]}').buffer
    const requestLicense = vi.fn(async () => licence)

    await startClearKeySession({
      media: fakeMedia() as never,
      access: fakeAccess(keys) as never,
      keyId: KEY_ID,
      requestLicense,
    })

    expect(sessions).toHaveLength(1)
    // The init data's bytes are asserted through the licence request below; jsdom's Uint8Array
    // is another realm's than TextEncoder's, so `expect.any(Uint8Array)` cannot match it.
    expect(sessions[0]?.generateRequest.mock.calls[0]?.[0]).toBe('keyids')
    const [message] = requestLicense.mock.calls[0] as unknown as [Uint8Array]
    expect(JSON.parse(Buffer.from(message).toString('utf8'))).toEqual({ kids: [KID_B64URL] })
    expect(sessions[0]?.update).toHaveBeenCalledWith(licence)
  })

  it('sets the media keys once per element and opens a session per track', async () => {
    const { keys, sessions } = fakeKeys()
    const media = fakeMedia()
    const access = fakeAccess(keys)
    const requestLicense = vi.fn(async () => new ArrayBuffer(2))

    await startClearKeySession({
      media: media as never,
      access: access as never,
      keyId: KEY_ID,
      requestLicense,
    })
    await startClearKeySession({
      media: media as never,
      access: access as never,
      keyId: KEY_ID,
      requestLicense,
    })

    expect(access.createMediaKeys).toHaveBeenCalledTimes(1)
    expect(media.setMediaKeys).toHaveBeenCalledTimes(1)
    expect(sessions).toHaveLength(2)
  })

  it('rejects when the host cannot get a licence, and closes the session', async () => {
    const { keys, sessions } = fakeKeys()
    const requestLicense = vi.fn(async () => {
      throw new Error('403')
    })

    await expect(
      startClearKeySession({
        media: fakeMedia() as never,
        access: fakeAccess(keys) as never,
        keyId: KEY_ID,
        requestLicense,
      }),
    ).rejects.toThrow('403')
    expect(sessions[0]?.close).toHaveBeenCalled()
  })
})
