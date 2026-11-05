import type { ReleaseWorkspace } from '@entities/release'
import { burstConfetti } from '@shared/lib/confetti'
import { useEffect } from 'react'

/** Releases already celebrated in this browser, as `<release id>:<status>`. */
const STORAGE_KEY = 'bitrate.artist-celebrated.v1'
/** Moments worth a celebration: approval and going live. */
const MILESTONES = new Set<ReleaseWorkspace['status']>(['READY', 'RELEASED'])
/** Enough history for any catalogue; the oldest entries go first. */
const REMEMBERED = 200

function readCelebrated(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    )
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

/**
 * Bursts confetti the first time the artist opens a release after it was approved or went
 * live. Remembered per release and status in this browser, so it happens once.
 */
export function useCelebration(
  release: Pick<ReleaseWorkspace, 'id' | 'status'>,
) {
  useEffect(() => {
    if (!MILESTONES.has(release.status)) return
    const moment = `${release.id}:${release.status}`
    const celebrated = readCelebrated()
    if (celebrated.includes(moment)) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...celebrated, moment].slice(-REMEMBERED)),
      )
    } catch {
      // Without storage the burst may repeat on a later visit, which is harmless.
    }
    burstConfetti()
  }, [release.id, release.status])
}
