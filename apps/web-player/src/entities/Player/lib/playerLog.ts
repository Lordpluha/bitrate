/**
 * Console tracing for the CMAF playback path.
 *
 * On by default in development; in any environment it can be toggled at runtime
 * with `localStorage.setItem('player-debug', '1')` (and `'0'` to silence it),
 * so the same build can be traced on a phone or in preview.
 */

const STORAGE_KEY = 'player-debug'

const STYLES = {
  abr: 'color:#f59e0b;font-weight:bold',
  buffer: 'color:#8b5cf6',
  error: 'color:#ef4444;font-weight:bold',
  fragment: 'color:#22c55e',
  path: 'color:#06b6d4;font-weight:bold',
  seek: 'color:#ec4899;font-weight:bold',
} as const

export type PlayerLogChannel = keyof typeof STYLES

const readOverride = (): boolean | null => {
  if (typeof localStorage === 'undefined') return null

  const value = localStorage.getItem(STORAGE_KEY)
  if (value === '1') return true
  if (value === '0') return false
  return null
}

/** True when playback tracing should be printed. */
export const isPlayerLogEnabled = (): boolean =>
  readOverride() ?? process.env.NODE_ENV === 'development'

/** Formats bytes as KB with one decimal, the scale fragments actually land in. */
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

/** Formats bits per second as Mbps. */
export const mbps = (bitsPerSecond: number) =>
  `${(bitsPerSecond / 1_000_000).toFixed(2)} Mbps`

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
