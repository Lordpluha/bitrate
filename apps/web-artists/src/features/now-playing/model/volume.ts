/** The listener's level, remembered in this browser; shared with the old preview player. */
const VOLUME_STORAGE_KEY = 'bitrate.artist-preview-volume.v1'

export function readVolume() {
  try {
    const stored = Number(localStorage.getItem(VOLUME_STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 && stored <= 1 ? stored : 1
  } catch {
    return 1
  }
}

export function storeVolume(level: number) {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(level))
  } catch {
    // The level still applies for this visit when storage is unavailable.
  }
}
