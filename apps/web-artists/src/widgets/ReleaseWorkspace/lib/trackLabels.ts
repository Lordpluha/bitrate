import {
  formatBytes,
  formatIsrc,
  type ReleaseWorkspace,
} from '@entities/release'
import type { Translate } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'

export type TrackDraft = ReleaseWorkspace['trackDrafts'][number]

export function durationLabel(value: number | null, t: Translate) {
  return value === null
    ? t('workspace.track.durationUnavailable')
    : formatDuration(value)
}

export const isrcLabel = (isrc: string | null, t: Translate) =>
  isrc
    ? t('workspace.track.isrc', { code: formatIsrc(isrc) })
    : t('workspace.track.noIsrc')

export function audioLabel(track: TrackDraft, t: Translate) {
  if (!track.hasAudio) return t('workspace.track.noAudio')
  const size =
    track.audioSizeBytes === null
      ? ''
      : ` · ${formatBytes(track.audioSizeBytes)}`
  return `${track.audioFileName ?? t('workspace.track.audioUploaded')}${size}`
}
