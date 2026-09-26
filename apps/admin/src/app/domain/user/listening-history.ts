/** One row of a listener's listening history — the listen event plus the track it names. */
export type ListeningHistoryEntry = {
  id: string
  listenedAt: Date
  trackId: string
  trackTitle: string
  artistUsername: string
}

/** Rows per page for the listener detail page's history section. */
export const LISTENING_HISTORY_PAGE_SIZE = 10
