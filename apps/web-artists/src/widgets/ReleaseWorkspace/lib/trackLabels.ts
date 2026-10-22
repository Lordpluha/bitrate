import {
  formatBytes,
  formatIsrc,
  type ReleaseWorkspace,
} from '@entities/release'
import { formatDuration } from '@shared/lib/format'

export type TrackDraft = ReleaseWorkspace['trackDrafts'][number]

export function durationLabel(value: number | null) {
  return value === null ? 'Duration unavailable' : formatDuration(value)
}

export const isrcLabel = (isrc: string | null) =>
  isrc ? `ISRC ${formatIsrc(isrc)}` : 'No ISRC yet'

export function audioLabel(track: TrackDraft) {
  if (!track.hasAudio) return 'No audio uploaded'
  const size =
    track.audioSizeBytes === null
      ? ''
      : ` · ${formatBytes(track.audioSizeBytes)}`
  return `${track.audioFileName ?? 'Audio uploaded'}${size}`
}
