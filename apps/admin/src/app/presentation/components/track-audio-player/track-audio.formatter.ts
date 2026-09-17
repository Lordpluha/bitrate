import type { TrackAudioFile } from '@domain/track'

/** Codec identifiers this panel knows a friendlier name for; anything else is shown verbatim. */
const CODEC_LABELS: Record<string, string> = {
  'mp4a.40.2': 'AAC',
}

/** "320 kbps (AAC)" for the quality selector's options. */
export function renditionLabel(file: TrackAudioFile): string {
  if (!file.codec) return `${file.bitrate} kbps`

  return `${file.bitrate} kbps (${CODEC_LABELS[file.codec] ?? file.codec})`
}
