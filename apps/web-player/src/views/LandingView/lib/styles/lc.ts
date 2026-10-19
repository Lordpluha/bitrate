import { cn } from '@bitrate/ui-react'
import { LANDING_RULES } from './landing.styles'

const cache = new Map<string, string>()

/**
 * Landing class names: the marker classes (the hooks the engine and context variants use) plus
 * the Tailwind utilities of every LANDING_RULES entry they match, merged in rule order so a
 * later entry wins like a later CSS rule. `#id` tokens pull in id rules without adding a class.
 * `extra` holds the element's own utilities (former inline styles) and wins over the rules.
 */
export const lc = (markers: string, extra = '') => {
  const key = `${markers}|${extra}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  const tokens = new Set(markers.split(/\s+/).filter(Boolean))
  const utilities = LANDING_RULES.filter(([k]) => tokens.has(k)).map(
    ([, u]) => u,
  )
  const classes = [...tokens].filter((t) => !t.startsWith('#'))
  const value = `${classes.join(' ')} ${cn(...utilities, extra)}`.trim()
  cache.set(key, value)
  return value
}

/** The same classes as a list, for engine code that adds them to elements it creates or marks. */
export const lcList = (markers: string, extra = '') =>
  lc(markers, extra).split(' ').filter(Boolean)
