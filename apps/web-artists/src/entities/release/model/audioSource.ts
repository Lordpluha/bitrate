import { refreshToken } from '@shared/api'
import { messageKey } from '@shared/i18n'

/** How the private master route is checked before the player is handed its URL. */
export interface AudioSourceDeps {
  probe: (url: string, init: RequestInit) => Promise<Response>
  refresh: () => Promise<boolean>
}

const defaultDeps: AudioSourceDeps = {
  probe: (url, init) => fetch(url, init),
  refresh: refreshToken,
}

const SESSION_EXPIRED = messageKey('media.player.sessionExpired')
const MASTER_GONE = messageKey('media.player.gone')
const CHECK_FAILED = messageKey('media.player.failed')

/** The API answers HEAD by streaming the whole master, so one ranged byte proves access. */
const PROBE: RequestInit = {
  method: 'GET',
  headers: { Range: 'bytes=0-0' },
  credentials: 'include',
}

async function probeStatus(url: string, deps: AudioSourceDeps) {
  try {
    const response = await deps.probe(url, PROBE)
    await response.body?.cancel()
    return response.status
  } catch (error) {
    throw new Error(CHECK_FAILED, { cause: error })
  }
}

/**
 * Resolves an owner-only master URL for `<bitrate-player>`. The element's `<audio>` cannot
 * renew an expired session, so a one-byte probe does it first; rejections carry a catalog key
 * the caller translates before the player shows it.
 */
export async function playableAudioUrl(
  url: string,
  deps: AudioSourceDeps = defaultDeps,
): Promise<string> {
  let status = await probeStatus(url, deps)
  if (status === 401) {
    if (!(await deps.refresh())) throw new Error(SESSION_EXPIRED)
    status = await probeStatus(url, deps)
  }
  if (status === 401) throw new Error(SESSION_EXPIRED)
  if (status === 404) throw new Error(MASTER_GONE)
  if (status < 200 || status >= 300) throw new Error(CHECK_FAILED)
  return url
}
