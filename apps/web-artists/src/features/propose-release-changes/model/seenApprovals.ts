/** Where the newest approval an artist already saw is kept, per release, in this browser. */
const storageKey = (releaseId: string) =>
  `bitrate.release-changes.seen.${releaseId}`

/** The newest approval time already shown for this release, or null when none or unavailable. */
export function readSeenApproval(releaseId: string): number | null {
  try {
    const stored = window.localStorage.getItem(storageKey(releaseId))
    const time = stored ? Date.parse(stored) : Number.NaN
    return Number.isNaN(time) ? null : time
  } catch {
    return null
  }
}

/** Remembers that approvals up to `at` were shown; storage failures only mean they show again. */
export function rememberSeenApproval(releaseId: string, at: string): void {
  try {
    window.localStorage.setItem(storageKey(releaseId), at)
  } catch {
    // Private mode or blocked storage: the approval simply shows on the next visit too.
  }
}
