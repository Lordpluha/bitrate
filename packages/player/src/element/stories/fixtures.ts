import type { BitratePlayerRendition, BitratePlayerSourceResolver } from '../../contract'

/** Story fixtures for `<bitrate-player>` — the same rendition shape the browser specs use. */
export const SINGLE_RENDITION: BitratePlayerRendition[] = [{ bitrate: 320, label: '320 kbps' }]

export const LADDER_RENDITIONS: BitratePlayerRendition[] = [
  { bitrate: 320, label: '320 kbps' },
  { bitrate: 192, label: '192 kbps' },
  { bitrate: 128, label: '128 kbps' },
]

/**
 * One second of silent 8 kHz, 8-bit mono PCM WAV, built in memory so the stories play a real
 * source without shipping an audio asset or reaching the network.
 */
function silentWavUrl(): string {
  const sampleRate = 8000
  const samples = sampleRate
  const buffer = new ArrayBuffer(44 + samples)
  const view = new DataView(buffer)
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i))
  }

  writeAscii(0, 'RIFF')
  view.setUint32(4, 36 + samples, true)
  writeAscii(8, 'WAVE')
  writeAscii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate, true)
  view.setUint16(32, 1, true)
  view.setUint16(34, 8, true)
  writeAscii(36, 'data')
  view.setUint32(40, samples, true)
  new Uint8Array(buffer, 44).fill(128)

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

let silentSource: string | null = null

/** Resolves every request to the in-memory silent track. */
export const resolveSilentSource: BitratePlayerSourceResolver = async () => {
  silentSource ??= silentWavUrl()
  return silentSource
}

/** Never settles — holds the element in its `preparing` state. */
export const resolvePending: BitratePlayerSourceResolver = () => new Promise<string>(() => {})

/** Rejects the way a host does when a track cannot be streamed; the message is shown as-is. */
export const resolveRejected: BitratePlayerSourceResolver = async () => {
  throw new Error('This track is not available in your region.')
}
