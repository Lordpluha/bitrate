import type { MusicTrack } from '@entities/music'
import {
  playableAudioUrl,
  releaseAudioUrl,
  releaseCoverUrl,
} from '@entities/release'
import type { NowPlayingTrack } from '@features/now-playing'
import { messageKey } from '@shared/i18n'

/** Whether a row can play: a sample/preview URL, or an uploaded master inside a release. */
export function canPreview(track: MusicTrack) {
  return Boolean(track.previewUrl || track.release)
}

/** The player key of a row; release tracks share it with the release workspace rows. */
export function previewKey(track: MusicTrack) {
  return track.release ? `${track.release.id}:${track.id}` : track.id
}

/**
 * A catalogue row for the workspace player. Demo rows play their preview URL; uploaded
 * recordings play their private master, checked first so an expired session is renewed.
 */
export function previewTrack(track: MusicTrack): NowPlayingTrack {
  const { previewUrl, release } = track
  return {
    key: previewKey(track),
    title: track.title,
    subtitle: track.artistName,
    coverUrl: track.cover ? releaseCoverUrl(track.cover) : null,
    releaseId: release?.id,
    resolve: previewUrl
      ? () => Promise.resolve(previewUrl)
      : release
        ? () => playableAudioUrl(releaseAudioUrl(release.id, track.id))
        : () =>
            Promise.reject(new Error(messageKey('music.preview.unavailable'))),
  }
}
