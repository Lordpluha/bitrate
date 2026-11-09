/** Browser-only request binding: an old tab cannot send writes as a newly selected account. */
let selectedArtist: string | null = null
export function bindArtistRequests(id: string | null) {
  if (typeof window !== 'undefined') selectedArtist = id
}
export function selectedRequestArtist(): string | null {
  return typeof window !== 'undefined' ? selectedArtist : null
}

export const ARTIST_SESSION_EVENT = 'bitrate.artist-session-change'
export function notifyArtistSessionChange(kind: 'changed' | 'signed-out') {
  try {
    localStorage.setItem(
      ARTIST_SESSION_EVENT,
      JSON.stringify({ kind, nonce: crypto.randomUUID() }),
    )
  } catch {
    /* Private browsing may restrict storage. */
  }
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(ARTIST_SESSION_EVENT)
      channel.postMessage({ kind })
      channel.close()
    }
  } catch {
    /* The storage event still handles browsers that restrict channels. */
  }
}
