import type { PaletteToken } from './palette'

/** A placeholder partner mark: background, ink and label (demo marks, not real partners). */
export type PartnerMark = { bg: PaletteToken; fg: PaletteToken; label: string }

export const PARTNER_MARKS: readonly PartnerMark[] = [
  { bg: 'purple-500', fg: 'white', label: 'ON AIR' },
  { bg: 'magenta-500', fg: 'white', label: 'LABEL' },
  { bg: 'blue-500', fg: 'white', label: 'STUDIO' },
  { bg: 'green-500', fg: 'green-950', label: 'SYNC' },
  { bg: 'amber-500', fg: 'amber-950', label: 'LIVE' },
  { bg: 'purple-50', fg: 'purple-800', label: 'FM' },
  { bg: 'neutral-900', fg: 'purple-400', label: 'DSP' },
  { bg: 'purple-400', fg: 'purple-950', label: 'MIX' },
  { bg: 'blue-400', fg: 'white', label: 'WAVE' },
  { bg: 'red-600', fg: 'red-50', label: 'B-SIDE' },
]
