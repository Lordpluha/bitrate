/**
 * Console tracing for the CMAF playback path.
 *
 * Off unless the host turns it on by default (web-player does in development); in
 * any environment it can be toggled at runtime with the host storage's
 * `player-debug` key — `'1'` on, `'0'` off — so the same build can be traced on
 * a phone or in preview.
 */

import { getCmafEngineEnvironment } from './environment'

const STORAGE_KEY = 'player-debug'

/**
 * DevTools `%c` styles, one colour per channel. The console is outside the element and its
 * theme, and cannot resolve `var(--color-*)`, so the channels use named CSS colours.
 */
const STYLES = {
  abr: 'color:orange;font-weight:bold',
  buffer: 'color:mediumpurple',
  error: 'color:tomato;font-weight:bold',
  fragment: 'color:limegreen',
  path: 'color:darkturquoise;font-weight:bold',
  seek: 'color:hotpink;font-weight:bold',
} as const

export type PlayerLogChannel = keyof typeof STYLES

const readOverride = (): boolean | null => {
  const { storage } = getCmafEngineEnvironment()
  if (!storage) return null

  const value = storage.getItem(STORAGE_KEY)
  if (value === '1') return true
  if (value === '0') return false
  return null
}

/** True when playback tracing should be printed. */
const isPlayerLogEnabled = (): boolean =>
  readOverride() ?? getCmafEngineEnvironment().debugByDefault

/** Formats bytes as KB with one decimal, the scale fragments actually land in. */
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

/** Formats bits per second as Mbps. */
export const mbps = (bitsPerSecond: number) => `${(bitsPerSecond / 1_000_000).toFixed(2)} Mbps`

export const playerLog = (
  channel: PlayerLogChannel,
  message: string,
  details?: Record<string, unknown>,
) => {
  if (!isPlayerLogEnabled()) return

  const label = `%c[player:${channel}]%c ${message}`

  if (details) {
    console.log(label, STYLES[channel], 'color:inherit', details)
    return
  }

  console.log(label, STYLES[channel], 'color:inherit')
}

/** One completed fragment download, with the throughput it produced. */
export type FragmentLogInput = {
  /** Which loader produced this line: the active track or the prefetch slot. */
  label: string
  bitrate: number
  index: number
  bytes: number
  durationMs: number
  bufferedAhead: number
}

export const logFragment = ({
  label,
  bitrate,
  index,
  bytes,
  durationMs,
  bufferedAhead,
}: FragmentLogInput) => {
  if (!isPlayerLogEnabled()) return

  const throughput = (bytes * 8 * 1000) / Math.max(durationMs, 1)

  playerLog(
    'fragment',
    `${label} #${index} @ ${bitrate}k — ${kb(bytes)} за ${Math.round(durationMs)} мс`,
    {
      скорость: mbps(throughput),
      'буфер впереди': `${bufferedAhead.toFixed(1)} с`,
    },
  )
}
