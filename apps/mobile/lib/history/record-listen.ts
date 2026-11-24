import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

/** `POST /history/tracks/{trackId}`: adds a listened track to the listener's history. */
export async function recordListen(trackId: string): Promise<void> {
  const { response } = await api.POST('/api/v1/history/tracks/{trackId}', { params: { path: { trackId } } })
  ensureOk(response, 'Failed to record listening history')
}
