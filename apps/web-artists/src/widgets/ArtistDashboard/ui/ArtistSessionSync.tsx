import {
  ARTIST_SESSION_EVENT,
  bindArtistRequests,
} from '@shared/auth/accountSelection'
import { useEffect } from 'react'

/** Reloading also discards the previous account's query cache, dialogs and private audio. */
export function ArtistSessionSync({ artistId }: { artistId: string }) {
  useEffect(() => {
    bindArtistRequests(artistId)
    let navigating = false
    const change = (value: unknown) => {
      if (
        navigating ||
        typeof value !== 'object' ||
        value === null ||
        !('kind' in value)
      )
        return
      if (value.kind !== 'changed' && value.kind !== 'signed-out') return
      navigating = true
      window.location.replace(
        value.kind === 'signed-out' ? '/login' : '/dashboard',
      )
    }
    const storage = (event: StorageEvent) => {
      if (event.key !== ARTIST_SESSION_EVENT || !event.newValue) return
      try {
        change(JSON.parse(event.newValue))
      } catch {
        /* Ignore unrelated malformed storage values. */
      }
    }
    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(ARTIST_SESSION_EVENT)
        : null
    if (channel) channel.onmessage = (event) => change(event.data)
    window.addEventListener('storage', storage)
    return () => {
      bindArtistRequests(null)
      channel?.close()
      window.removeEventListener('storage', storage)
    }
  }, [artistId])
  return null
}
