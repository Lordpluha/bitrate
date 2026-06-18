import { NON_LAYOUT_KEYS } from '../constants.mjs'
import { formatLayoutVar } from '../css-builder.mjs'

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Layout generator
 * Auto-detects all top-level token keys that are not palette/typography/themes.
 */
export function generateLayout(tokens) {
  const lines = []

  for (const [tokenKey, entries] of Object.entries(tokens)) {
    if (NON_LAYOUT_KEYS.has(tokenKey)) continue
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue

    const sectionName = capitalize(tokenKey.replace(/-/g, ' '))
    lines.push(`  /* ${sectionName} */`)

    for (const [key, value] of Object.entries(entries)) {
      lines.push(formatLayoutVar(tokenKey, key, value))
    }
    lines.push('')
  }

  return lines
}
